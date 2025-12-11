import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../constants";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { Keypair } from "@solana/web3.js";
import { IDL, WHIRLPOOLS_CONFIG_PUBKEY } from "../constants";
import Decimal from "decimal.js";

import { orderMints } from "@orca-so/whirlpools";
import { address } from "@solana/kit";

import { PDAUtil, WhirlpoolContext, TickUtil } from "@orca-so/whirlpools-sdk";

export const getLaunchConfigs = async (
  rpcurl: string,
  wallet: any,
  tokenAmountB: number, // liquidity
  tokenAmountA: number, // supply
  tickSpacing: number,
  feeTierAddress: string
) => {
  const GOLDC_MINT = Buffer.from("goldc_mint");
  const TICK_SPACING = tickSpacing;
  const FEE_TIER_INDEX = 1024 + TICK_SPACING;
  const FEE_TIER_PUBKEY = new PublicKey(feeTierAddress);

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  // 🔹 Dynamic WASM import (must stay here in SDK)
  let core: any;
  try {
    core = await import("@orca-so/whirlpools-core");
  } catch {
    throw new Error("Failed to initialize Orca whirlpools core (WASM).");
  }

  const {
    priceToSqrtPrice,
    getTickArrayStartTickIndex,
    getFullRangeTickIndexes,
  } = core;

  if (typeof priceToSqrtPrice !== "function") {
    throw new Error(
      "priceToSqrtPrice not available after importing @orca-so/whirlpools-core."
    );
  }

  // 🔹 Anchor Provider + Program
  const connection = new Connection(
    rpcurl || "https://api.mainnet-beta.solana.com",
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  // 🔹 GoldC Mint PDA (unchanged)
  const [goldcMintPda] = PublicKey.findProgramAddressSync(
    [GOLDC_MINT],
    program.programId
  );

  // 🔹 Token mint to be launched
  const tokenMintB = Keypair.generate();

  // 🟢 Ensure correct mint ordering for Orca
  const [tokenAMint, tokenBMint] = orderMints(
    address(goldcMintPda.toBase58()),
    address(tokenMintB.publicKey.toBase58())
  );

  const tokenAPK = new PublicKey(tokenAMint);
  const tokenBPK = new PublicKey(tokenBMint);

  const noFlip = tokenAMint === goldcMintPda.toBase58();

  // 🟢 Amount mapping according to mint orientation
  const tokenAmount0U64 = BigInt(tokenAmountB);
  const tokenAmount1U64 = BigInt(tokenAmountA);

  const [tokenAmountAU64, tokenAmountBU64] = noFlip
    ? [tokenAmount0U64, tokenAmount1U64]
    : [tokenAmount1U64, tokenAmount0U64];

  const [decimalsA, decimalsB] = noFlip ? [9, 9] : [9, 9];

  // 🟢 Price = B / A
  const initialPrice = new Decimal(tokenAmountBU64.toString()).div(
    new Decimal(tokenAmountAU64.toString())
  );
  const INITIAL_SQRT_PRICE = new BN(
    priceToSqrtPrice(initialPrice.toNumber(), decimalsA, decimalsB).toString()
  );

  // 🟢 Full range ticks
  const { tickLowerIndex, tickUpperIndex } =
    getFullRangeTickIndexes(TICK_SPACING);

  const START_TA_LOWER = getTickArrayStartTickIndex(
    tickLowerIndex,
    TICK_SPACING
  );
  const START_TA_UPPER = getTickArrayStartTickIndex(
    tickUpperIndex,
    TICK_SPACING
  );

  // 🟢 Updated whirlpool mint ordering logic
  let whirlpool: PublicKey;
  if (goldcMintPda >= tokenMintB.publicKey) {
    whirlpool = getWhirlpoolPda(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      WHIRLPOOLS_CONFIG_PUBKEY,
      tokenMintB.publicKey,
      goldcMintPda,
      TICK_SPACING
    );
  } else {
    whirlpool = getWhirlpoolPda(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      WHIRLPOOLS_CONFIG_PUBKEY,
      goldcMintPda,
      tokenMintB.publicKey,
      TICK_SPACING
    );
  }

  // 🔹 Tick arrays
  const tickArrayLower = getTickArrayPda(
    whirlpool,
    START_TA_LOWER,
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
  const tickArrayUpper = getTickArrayPda(
    whirlpool,
    START_TA_UPPER,
    ORCA_WHIRLPOOL_PROGRAM_ID
  );

  // 🔹 Token badges
  const tokenBadge0 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY, tokenAPK);
  const tokenBadge1 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY, tokenBPK);
  const [tokenBadgeA, tokenBadgeB] = noFlip
    ? [tokenBadge0, tokenBadge1]
    : [tokenBadge1, tokenBadge0];

  // 🔹 Vaults (same)
  const tokenVaultA = Keypair.generate();
  const tokenVaultB = Keypair.generate();

  // 🔹 Metadata + Store + Oracle
  const metadataAccountB = deriveMetadataPda(tokenMintB.publicKey);
  const launchtokenStore = deriveLaunchStore(whirlpool, program.programId);
  const [oraclePda] = deriveOraclePda(whirlpool, ORCA_WHIRLPOOL_PROGRAM_ID);

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority")],
    program.programId
  );

  return {
    provider,
    program,
    wallet,
    connection,

    // Constants
    WHIRLPOOLS_CONFIG_PUBKEY,
    FEE_TIER_PUBKEY,
    TICK_SPACING,
    FEE_TIER_INDEX,
    INITIAL_SQRT_PRICE,
    START_TA_LOWER,
    START_TA_UPPER,
    tickLowerIndex,
    tickUpperIndex,

    // Mints & PDAs
    goldcMintPda,
    tokenMintB,
    tokenAPK,
    tokenBPK,
    noFlip,
    // Whirlpool + PDAs
    whirlpool,
    tickArrayLower,
    tickArrayUpper,
    tokenBadgeA,
    tokenBadgeB,
    tokenVaultA,
    tokenVaultB,
    metadataAccountB,
    launchtokenStore,
    oraclePda,
    vaultAuthority,

    // Amounts
    tokenAmountAU64,
    tokenAmountBU64,
    tokenAmount0U64,
    tokenAmount1U64,
  };
};

export const getTicksConfigs = async (
  configs: any,
  poolID: PublicKey,
  wallet: any,
  tickSpacing: number
): Promise<{
  initialized: boolean;
  tickArrayLowerPDA: any;
  tickArrayUpperPDA: any;
  newTickLower: number;
  newTickUpper: number;
  signature?: string | null;
  error: any;
}> => {
  try {
  
    const whirlpool_ctx = WhirlpoolContext.withProvider(configs.provider);
    const fetcher = whirlpool_ctx.fetcher;

    const whirlpool: any = await fetcher.getPool(poolID);
    const currentTick = whirlpool.tickCurrentIndex;

    const rangeSize = tickSpacing * 256;
    const rawTickLower = currentTick - rangeSize;
    const rawTickUpper = currentTick + rangeSize;

    const newTickLower = Math.floor(rawTickLower / tickSpacing) * tickSpacing;
    const newTickUpper = Math.ceil(rawTickUpper / tickSpacing) * tickSpacing;

    const tickArrayLowerStartIndex = TickUtil.getStartTickIndex(
      newTickLower,
      tickSpacing,
      0
    );
    const tickArrayUpperStartIndex = TickUtil.getStartTickIndex(
      newTickUpper,
      tickSpacing,
      0
    );

    const tickArrayLowerPDA = PDAUtil.getTickArray(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      poolID,
      tickArrayLowerStartIndex
    );
    const tickArrayUpperPDA = PDAUtil.getTickArray(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      poolID,
      tickArrayUpperStartIndex
    );

    // Check which tick arrays need to be initialized
    const tickArraysToInit = [];
    const tickArrayPDAs = [
      { pda: tickArrayLowerPDA, startIndex: tickArrayLowerStartIndex },
      { pda: tickArrayUpperPDA, startIndex: tickArrayUpperStartIndex },
    ];

    for (const { pda, startIndex } of tickArrayPDAs) {
      try {
        const exists = await configs.connection.getAccountInfo(pda.publicKey);
        if (!exists) {
          tickArraysToInit.push({ pda, startIndex });
        }
      } catch (error) {
        tickArraysToInit.push({ pda, startIndex });
      }
    }

    // No init required
    if (tickArraysToInit.length === 0) {
      return {
        signature: null,
        initialized: false,
        tickArrayLowerPDA,
        tickArrayUpperPDA,
        newTickLower,
        newTickUpper,
        error: null,
      };
    }

    // Build IX list with correct startIndex for each tick array
    const ixList = [];

    for (const { pda, startIndex } of tickArraysToInit) {
      const ix = await configs.program.methods
        .initTickArray(startIndex, newTickLower, newTickUpper)
        .accounts({
          whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
          whirlpool: poolID,
          funder: wallet.publicKey,
          tickArray: pda.publicKey,
          systemProgram: SystemProgram.programId,
          launchTokenStore: configs.launchtokenStore,
        })
        .instruction();

      ixList.push(ix);
    }

    const tx = new Transaction().add(...ixList);
    tx.feePayer = wallet.publicKey;

    const { blockhash, lastValidBlockHeight } =
      await configs.connection.getLatestBlockhash("confirmed");

    tx.recentBlockhash = blockhash;

    const signature = await wallet.sendTransaction(tx, configs.connection);

    await configs.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    return {
      signature,
      initialized: true,
      tickArrayLowerPDA,
      tickArrayUpperPDA,
      newTickLower,
      newTickUpper,
      error: null,
    };
  } catch (e: any) {
    const logs: string[] | undefined = e?.logs ?? e?.getLogs?.();
    console.error("❌ getTicksConfigs failed:", e?.message || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));

    return {
      initialized: false,
      signature: null,
      tickArrayLowerPDA: undefined,
      tickArrayUpperPDA: undefined,
      newTickLower: 0,
      newTickUpper: 0,
      error: e,
    };
  }
};

function leU16(n: number) {
  return Buffer.from(new Uint16Array([n]).buffer);
}

export function getWhirlpoolPda(
  programId: PublicKey,
  config: PublicKey,
  mintA: PublicKey,
  mintB: PublicKey,
  tick_spacing: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("whirlpool"),
      config.toBuffer(),
      mintA.toBuffer(),
      mintB.toBuffer(),
      leU16(tick_spacing),
    ],
    programId
  );
  return pda;
}

export function getTickArrayPda(
  whirlpool: PublicKey,
  startTickIndex: number,
  programId: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tick_array"),
      whirlpool.toBuffer(),
      Buffer.from(startTickIndex.toString(), "utf8"),
    ],
    programId
  );
  return pda;
}

// whirlpool token vault PDA (v1/v2 standard derivation)
export function getTokenVaultPda(
  whirlpool: PublicKey,
  tokenMint: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), whirlpool.toBuffer(), tokenMint.toBuffer()],
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
  return pda;
}

export function deriveTokenBadge(
  whirlpoolsConfig: PublicKey,
  tokenMint: PublicKey
): PublicKey {
  const [badge] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_badge"),
      whirlpoolsConfig.toBuffer(),
      tokenMint.toBuffer(),
    ],
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
  return badge;
}

// Metaplex Metadata PDA for a mint
export function deriveMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

export function deriveLaunchStore(
  whirlpool: PublicKey,
  programId: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("launch_store"), whirlpool.toBuffer()],
    programId
  );
  return pda;
}

export function deriveOraclePda(
  whirlpool: PublicKey,
  whirlpoolProgramId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("oracle"), whirlpool.toBuffer()],
    whirlpoolProgramId
  );
}
