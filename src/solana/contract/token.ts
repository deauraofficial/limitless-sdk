import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  MEMO_PROGRAM,
  METADATA_UPDATE_AUTH,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../constants";
import { getLaunchConfigs } from "./helpers";
import Decimal from "decimal.js";

interface Metadata {
  name: string;
  symbol: string;
  uri: string;
}

export const runLaunchFlow = async (
  rpcurl: string,
  wallet: any,
  metadata: any,
  tokenSupply: number,
  liquidityAmount: number,
  setStep: (state: string) => void,
  tickSpacing: number,
  feeTierAddress: string
) => {
  const results: any = {};

  if (!/^https?:\/\/.+/.test(metadata.uri)) {
    const err = "Invalid URI: must be an http/https URL";
    results.error = err;
    return results;
  }

  if (!Number.isFinite(tokenSupply) || tokenSupply <= 0) {
    const err = "Invalid token supply: must be a positive number";
    results.error = err;
    return results;
  }

  if (!Number.isFinite(liquidityAmount) || liquidityAmount <= 0) {
    const err = "Invalid liquidity amount: must be a positive number";
    results.error = err;
    return results;
  }

  const MAX_SUPPLY = 1_000_000_000;
  if (tokenSupply > MAX_SUPPLY) {
    const err = `Invalid token supply: must not exceed ${MAX_SUPPLY}`;
    results.error = err;
    return results;
  }

  const MAX_LIQUIDITY = 1_000_000_000;
  if (liquidityAmount > MAX_LIQUIDITY) {
    const err = `Invalid liquidity amount: must not exceed ${MAX_LIQUIDITY}`;
    results.error = err;
    return results;
  }

  if (!tickSpacing) {
    const err = `Unable to get fee tier! try again later.`;
    results.error = err;
    return results;
  }

  try {
    const configs = await getLaunchConfigs(
      rpcurl,
      wallet,
      liquidityAmount,
      tokenSupply,
      tickSpacing,
      feeTierAddress
    );
    results.configs = configs;
    // 🔹 2. Graduate Token
    setStep("Minting Token...");
    // return results
    const grad = await graduateToken(
      wallet,
      metadata,
      configs,
      tokenSupply,
      liquidityAmount
    );
    results.graduateToken = grad;
    if (grad.error) {
      results.error = grad.error;
      return results;
    }
    // 🔹 3. Add Liquidity
    setStep("Adding Liquidity...");
    const addLiq = await addLiquidity(
      wallet,
      configs,
      tokenSupply, // tokenAmountA
      liquidityAmount // tokenAmountB
    );
    results.addLiquidity = addLiq;
    if (addLiq.error) {
      results.error = addLiq.error;
      return results;
    }
    return results;
  } catch (err: any) {
    console.error("❌ runLaunchFlow failed:", err);
    results.error = err;
    return results;
  }
};

export const graduateToken = async (
  wallet: any,
  metadata: Metadata,
  configs: any,
  tokenAmount0: number, // token supply
  tokenAmount1: number // liquidity amount
) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  const {
    provider,
    program,
    whirlpool,
    vaultAuthority,
    goldcMintPda,
    tokenMintB,
    metadataAccountB,
    tokenBadgeA,
    tokenBadgeB,
    tokenVaultA,
    tokenVaultB,
    tickArrayLower,
    tickArrayUpper,
    launchtokenStore,
    WHIRLPOOLS_CONFIG_PUBKEY,
    FEE_TIER_PUBKEY,
    TICK_SPACING,
    INITIAL_SQRT_PRICE,
    START_TA_LOWER: startTickIndexLower,
    START_TA_UPPER: startTickIndexUpper,
    tickLowerIndex,
    tickUpperIndex,
  } = configs;

  // Use the provided sqrt price directly
  const sqrtPrice = new BN(INITIAL_SQRT_PRICE.toString());

  // Compute budget ix
  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  // Build instruction
  const ixBuilder = program.methods
    .launchToken(
      TICK_SPACING,
      sqrtPrice,
      startTickIndexLower,
      startTickIndexUpper,
      tickLowerIndex,
      tickUpperIndex,
      metadata.name,
      metadata.symbol,
      metadata.uri,
      new BN(tokenAmount0),
      new BN(tokenAmount1)
    )
    .accountsPartial({
      launchTokenStore: launchtokenStore,
      whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpoolsConfig: WHIRLPOOLS_CONFIG_PUBKEY,
      vaultAuthority,
      whirlpool,
      tokenMintA: goldcMintPda,
      tokenMintB: tokenMintB.publicKey,
      metadataAccount: metadataAccountB,
      tokenBadgeA,
      tokenBadgeB,
      funder: wallet.publicKey,
      tokenVaultA: tokenVaultA.publicKey,
      tokenVaultB: tokenVaultB.publicKey,
      feeTier: FEE_TIER_PUBKEY,
      tickArrayLower,
      tickArrayUpper,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    });

  // Transaction
  let tx = await ixBuilder.transaction();
  tx.instructions.unshift(computeUnitsIx);
  tx.feePayer = wallet.publicKey;

  try {
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;

    // Partial sign with init accounts
    tx.partialSign(tokenMintB, tokenVaultA, tokenVaultB);

    // Send via Phantom (signs fee payer)
    const sig = await wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    // console.log("✅ launchToken tx:", sig);

    return { signature: sig, configs, error: null };
  } catch (e: any) {
    const logs: string[] | undefined = e?.logs ?? e?.getLogs?.();
    console.error("❌ SendTransactionError:", e?.message || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));
    return { signature: null, configs, error: e };
  }
};

export const addLiquidity = async (
  wallet: any,
  configs: any,
  tokenAmountA: number, // UI: token supply
  tokenAmountB: number // UI: liquidity
) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  const {
    provider,
    program,
    whirlpool,
    vaultAuthority,
    tokenAPK, // ordered A mint
    tokenBPK, // ordered B mint
    tokenVaultA,
    tokenVaultB,
    tickArrayLower,
    tickArrayUpper,
    launchtokenStore,
    INITIAL_SQRT_PRICE,
    tickLowerIndex,
    tickUpperIndex,
    noFlip,
  } = configs;

  //? Dynamic import
  let core: any;
  try {
    core = await import("@orca-so/whirlpools-core");
  } catch (e) {
    console.error("❌ Failed to load @orca-so/whirlpools-core:", e);
    throw new Error("Failed to initialize Orca whirlpools core (WASM).");
  }

  // now call the functions from core
  const increaseLiquidityQuoteA = core.increaseLiquidityQuoteA;
  const increaseLiquidityQuoteB = core.increaseLiquidityQuoteB;

  if (typeof increaseLiquidityQuoteA !== "function") {
    throw new Error(
      "increaseLiquidityQuoteA not available after importing @orca-so/whirlpools-core."
    );
  }
  if (typeof increaseLiquidityQuoteB !== "function") {
    throw new Error(
      "increaseLiquidityQuoteB not available after importing @orca-so/whirlpools-core."
    );
  }

  // 1) Map UI inputs into ordered A/B amounts
  const amountAUsed = noFlip ? tokenAmountA : tokenAmountB;
  const amountBUsed = noFlip ? tokenAmountB : tokenAmountA;

  // 2) Scale to u64 (9 decimals)
  const scaledAmountA = BigInt(
    new Decimal(amountAUsed.toString()).mul(new Decimal(10).pow(9)).toString()
  );
  const scaledAmountB = BigInt(
    new Decimal(amountBUsed.toString()).mul(new Decimal(10).pow(9)).toString()
  );

  // 3) Quote using ordered amounts
  const quoteA = increaseLiquidityQuoteA(
    scaledAmountA,
    0,
    BigInt(INITIAL_SQRT_PRICE.toString()),
    tickLowerIndex,
    tickUpperIndex
  );

  const quoteB = increaseLiquidityQuoteB(
    scaledAmountB,
    0,
    BigInt(INITIAL_SQRT_PRICE.toString()),
    tickLowerIndex,
    tickUpperIndex
  );

  // 4) Pick the smaller liquidityDelta, same as test
  const useA = quoteA.liquidityDelta < quoteB.liquidityDelta;
  const liquidityDelta = useA ? quoteA.liquidityDelta : quoteB.liquidityDelta;
  
  // 5) Position accounts
  const positionMint = anchor.web3.Keypair.generate();
  const [position] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), positionMint.publicKey.toBuffer()],
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
  const [positionOwnerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position_owner")],
    program.programId
  );
  const positionTokenAccount = getAssociatedTokenAddressSync(
    positionMint.publicKey,
    positionOwnerPda,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const tokenOwnerAccountA = getAssociatedTokenAddressSync(
    tokenAPK,
    positionOwnerPda,
    true,
    TOKEN_PROGRAM_ID
  );
  const tokenOwnerAccountB = getAssociatedTokenAddressSync(
    tokenBPK,
    positionOwnerPda,
    true
  );

  // 6) Vault mapping must mirror token A/B order
  const vaultA = noFlip ? tokenVaultA.publicKey : tokenVaultB.publicKey;
  const vaultB = noFlip ? tokenVaultB.publicKey : tokenVaultA.publicKey;

  // 7) Build ix
  const ixBuilder = program.methods
    .addLiqudity(true, new BN(liquidityDelta.toString()))
    .accountsPartial({
      whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
      vaultAuthority,
      launchTokenStore: launchtokenStore,
      whirlpool,
      tokenMintA: tokenAPK,
      tokenMintB: tokenBPK,
      funder: wallet.publicKey,
      tokenVaultA: vaultA,
      tokenVaultB: vaultB,
      tickArrayLower,
      tickArrayUpper,
      positionOwner: positionOwnerPda,
      position,
      positionMint: positionMint.publicKey,
      positionTokenAccount,
      tokenOwnerAccountA,
      tokenOwnerAccountB,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      metadataUpdateAuth: METADATA_UPDATE_AUTH,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      memoProgram: MEMO_PROGRAM,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    });

  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  let tx = await ixBuilder.transaction();
  tx.instructions.unshift(computeUnitsIx);
  tx.feePayer = wallet.publicKey;

  try {
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;

    // Signers
    tx.partialSign(positionMint, tokenVaultA, tokenVaultB);

    const sig = await wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    // console.log("✅ addLiquidity tx:", sig);
    return {
      signature: sig,
      positionMint,
      position,
      positionOwnerPda,
      positionTokenAccount,
      tokenOwnerAccountA,
      tokenOwnerAccountB,
      usedQuote: useA ? "A" : "B",
      error: null,
    };
  } catch (e: any) {
    const logs: string[] | undefined = e?.logs ?? e?.getLogs?.();
    console.error("❌ addLiquidity failed:", e?.message || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));
    return { signature: null, error: e };
  }
};
