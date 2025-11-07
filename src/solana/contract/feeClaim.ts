import {
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  MEMO_PROGRAM,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  TREASURY_ADDRESS,
} from "../constants";

export const collectFees = async (
  wallet: any,
  configs: any,
  positionData: any
) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  const {
    provider,
    program,
    whirlpool,
    goldcMintPda,
    tokenMintB,
    tokenVaultA,
    tokenVaultB,
    launchtokenStore,
    protocolFeeAccountA,
    protocolFeeAccountB,
    connection,
  } = configs;

  const { position, positionOwnerPda, positionTokenAccount } = positionData;

  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  // Fee destinations (PDA side)
  const feeDestinationA = getAssociatedTokenAddressSync(
    goldcMintPda,
    positionOwnerPda,
    true,
    TOKEN_PROGRAM_ID
  );

  const feeDestinationB = getAssociatedTokenAddressSync(
    tokenMintB.publicKey,
    positionOwnerPda,
    true,
    TOKEN_PROGRAM_ID
  );

  // Build the fee collection instruction (raw)
  const ix = await program.methods
    .collectProtocolFee()
    .accountsPartial({
      whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpool,
      positionAuthority: positionOwnerPda,
      position,
      positionTokenAccount,
      tokenMintA: goldcMintPda,
      tokenMintB: tokenMintB.publicKey,
      tokenOwnerAccountA: feeDestinationA,
      tokenVaultA: tokenVaultA.publicKey,
      tokenOwnerAccountB: feeDestinationB,
      tokenVaultB: tokenVaultB.publicKey,
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_PROGRAM_ID,
      memoProgram: MEMO_PROGRAM,
      launchTokenStore: launchtokenStore,
      protocolTreasuery: TREASURY_ADDRESS,
      protocolFeeAccountA,
      protocolFeeAccountB,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  // ✅ Build transaction manually
  const tx = new Transaction().add(computeUnitsIx, ix);
  tx.feePayer = wallet.publicKey;

  // ✅ Ensure ATA for Token B (user side) exists
  const ataB = await getAssociatedTokenAddress(
    tokenMintB.publicKey,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const ataInfo = await connection.getAccountInfo(ataB);
  if (!ataInfo) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer (Phantom signs)
      ataB, // ATA to create
      wallet.publicKey, // owner of ATA
      tokenMintB.publicKey, // Mint
      TOKEN_PROGRAM_ID
    );
    tx.instructions.unshift(createAtaIx); // prepend ATA creation
  }

  try {
    // ⚠️ OLD APPROACH (commented out)
    // const sig = await provider.sendAndConfirm(tx, []);

    // 🔹 NEW APPROACH: fresh blockhash + wallet.sendTransaction + explicit confirm
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash("confirmed");

    tx.recentBlockhash = blockhash;

    const sig = await wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    console.log("✅ collectFees tx:", sig);

    return {
      signature: sig,
      feeDestinationA,
      feeDestinationB,
      error: null,
    };
  } catch (e: any) {
    const logs: string[] | undefined = e?.logs ?? e?.getLogs?.();
    console.error("❌ collectFees failed:", e?.message || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));

    return {
      signature: null,
      error: e,
    };
  }
};

export const claimCreatorFee = async (
  wallet: any,
  configs: any,
  positionData: any
) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }

  const {
    provider,
    program,
    whirlpool,
    goldcMintPda,
    tokenMintB,
    launchtokenStore,
  } = configs;

  const { positionOwnerPda, tokenOwnerAccountA, tokenOwnerAccountB } =
    positionData;

  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  // Claimant = wallet owner (Phantom user)
  const claimantTokenA = getAssociatedTokenAddressSync(
    goldcMintPda,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const claimantTokenB = getAssociatedTokenAddressSync(
    tokenMintB.publicKey,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  // Build raw instruction
  const ix = await program.methods
    .claimCreatorFee()
    .accountsPartial({
      launchtokenStore,
      claimant: wallet.publicKey,
      whirlpool,
      positionAuthority: positionOwnerPda,
      tokenMintA: goldcMintPda,
      tokenMintB: tokenMintB.publicKey,
      feeVaultA: tokenOwnerAccountA,
      feeVaultB: tokenOwnerAccountB,
      claimantTokenA,
      claimantTokenB,
      tokenProgramA: TOKEN_PROGRAM_ID,
      tokenProgramB: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  // Build transaction manually
  const tx = new Transaction().add(computeUnitsIx, ix);
  tx.feePayer = wallet.publicKey;

  try {
    // ⚠️ OLD APPROACH (commented out)
    // const sig = await provider.sendAndConfirm(tx, []);

    // 🔹 NEW APPROACH: fresh blockhash + wallet.sendTransaction + explicit confirm
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash("confirmed");

    tx.recentBlockhash = blockhash;

    const sig = await wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    console.log("✅ claimCreatorFee tx:", sig);

    return {
      signature: sig,
      claimantTokenA,
      claimantTokenB,
      error: null,
    };
  } catch (e: any) {
    const logs: string[] | undefined = e?.logs ?? e?.getLogs?.();
    console.error("❌ claimCreatorFee failed:", e?.message || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));

    return {
      signature: null,
      error: e,
    };
  }
};
