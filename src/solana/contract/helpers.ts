import { Connection, PublicKey } from "@solana/web3.js";
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

export const getLaunchConfigs = async (
  rpcurl: string,
  wallet: any,
  tokenAmountB: number, // liquidity
  tokenAmountA: number, // supply,
  tickSpacing: number,
  feeTierAddress: string
) => {
  const GOLDC_MINT = Buffer.from("goldc_mint");
  const TICK_SPACING = tickSpacing; //128;
  const FEE_TIER_INDEX = 1024 + TICK_SPACING;
  const FEE_TIER_PUBKEY = new PublicKey(feeTierAddress);

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  //? Dynamic import
  let core: any;
  try {
    core = await import("@orca-so/whirlpools-core");
  } catch (e) {
    console.error("❌ Failed to load @orca-so/whirlpools-core:", e);
    throw new Error("Failed to initialize Orca whirlpools core (WASM).");
  }

  // now call the functions from core
  const priceToSqrtPrice = core.priceToSqrtPrice;
  const getTickArrayStartTickIndex = core.getTickArrayStartTickIndex;
  const getFullRangeTickIndexes = core.getFullRangeTickIndexes;

  if (typeof priceToSqrtPrice !== "function") {
    throw new Error(
      "priceToSqrtPrice not available after importing @orca-so/whirlpools-core."
    );
  }

  // Anchor provider
  const connection = new Connection(
    rpcurl || "https://api.mainnet-beta.solana.com",
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  // GoldC Mint (PDA under your program)
  const [goldcMintPda] = PublicKey.findProgramAddressSync(
    [GOLDC_MINT],
    program.programId
  );

  // New token mint (to be graduated/launched)
  const tokenMintB = Keypair.generate();

  // 🟢 Order mints (Orca always expects ordered mints)
  const [tokenAMint, tokenBMint] = orderMints(
    address(goldcMintPda.toBase58()),
    address(tokenMintB.publicKey.toBase58())
  );
  const tokenAPK = new PublicKey(tokenAMint);
  const tokenBPK = new PublicKey(tokenBMint);
  const noFlip = tokenAMint === goldcMintPda.toBase58();

  // Map amounts according to A/B order
  const [tokenAmountAU64, tokenAmountBU64] = noFlip
    ? [BigInt(tokenAmountA), BigInt(tokenAmountB)]
    : [BigInt(tokenAmountB), BigInt(tokenAmountA)];
  const [decimalsA, decimalsB] = [9, 9]; // both 9 decimals

  // 🟢 Price = tokenB / tokenA
  const initialPrice = new Decimal(tokenAmountBU64.toString()).div(
    new Decimal(tokenAmountAU64.toString())
  );
  const INITIAL_SQRT_PRICE = new BN(
    priceToSqrtPrice(initialPrice.toNumber(), decimalsA, decimalsB).toString()
  );
  // return INITIAL_SQRT_PRICE;
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

  // Whirlpool PDA
  const whirlpool = getWhirlpoolPda(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    WHIRLPOOLS_CONFIG_PUBKEY,
    tokenAPK,
    tokenBPK,
    TICK_SPACING
  );

  // Tick arrays
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

  // Token badges
  const tokenBadge0 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY, tokenAPK);
  const tokenBadge1 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY, tokenBPK);
  const [tokenBadgeA, tokenBadgeB] = noFlip
    ? [tokenBadge0, tokenBadge1]
    : [tokenBadge1, tokenBadge0];

  // Vaults
  const tokenVaultA = Keypair.generate();
  const tokenVaultB = Keypair.generate();

  // Metadata + Launch store
  const metadataAccountB = deriveMetadataPda(tokenMintB.publicKey);
  const launchtokenStore = deriveLaunchStore(whirlpool, program.programId);

  // Oracle
  const [oraclePda] = deriveOraclePda(whirlpool, ORCA_WHIRLPOOL_PROGRAM_ID);

  // Vault authority
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
    // Token mints
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
  };
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
