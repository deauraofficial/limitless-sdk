import { withAuth } from "../auth/withAuth";
import { ClaimFeeParams, SDKResponse } from "./types";
import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { IDL, GOLDC_MINT } from "./constants"; 
import { deriveLaunchStore } from "./contract/helpers";
import { orderMints } from "@orca-so/whirlpools";
import { address } from "@solana/kit";

const _claimFee = async (params: ClaimFeeParams): Promise<SDKResponse> => {
  const { rpcurl, wallet, tokenMint, whirlpool } = params;

  if (!wallet || !wallet?.publicKey || !wallet?.sendTransaction) {
    return { success: false, error: "Wallet is required" };
  }

  if (!tokenMint) {
    return { success: false, error: "Token mint is required" };
  }

  if (!whirlpool) {
    return { success: false, error: "Whirlpool address is required" };
  }

  if (!rpcurl) {
    return { success: false, error: "RPC URL is required" };
  }

  try {
    const connection = new Connection(rpcurl, "confirmed");

    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });

    const program = new anchor.Program(IDL as anchor.Idl, provider);

    const launchtokenStore = deriveLaunchStore(
      new PublicKey(whirlpool),
      program.programId
    );

    const [goldcMintPda] = PublicKey.findProgramAddressSync(
      [GOLDC_MINT],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("position_owner")],
      program.programId
    );

    const [tokenAMint, tokenBMint] = orderMints(
      address(goldcMintPda.toBase58()),
      address(tokenMint.toBase58())
    );

    const tokenAPK = new PublicKey(tokenAMint);
    const tokenBPK = new PublicKey(tokenBMint);

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

    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    const claimantTokenA = getAssociatedTokenAddressSync(
      goldcMintPda,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    // ✅ Added TOKEN_PROGRAM_ID to match working code
    const claimantTokenB = getAssociatedTokenAddressSync(
      tokenMint,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    const ix = await program.methods
      .claimCreatorFee()
      .accountsPartial({
        launchtokenStore,
        claimant: wallet.publicKey,
        whirlpool,
        positionAuthority: positionOwnerPda,
        tokenMintA: goldcMintPda,
        tokenMintB: tokenMint,
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

    const tx = new Transaction().add(computeUnitsIx, ix);
    tx.feePayer = wallet.publicKey;

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

    return {
      success: true,
      data: {
        signature: sig,
      },
    };
  } catch (error: any) {
    const logs: string[] | undefined = error?.logs ?? error?.getLogs?.();
    console.error("❌ claimCreatorFee failed:", error?.message || error);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));

    return {
      success: false,
      error: error?.message || "Unknown error occurred",
    };
  }
};

export const claimCreatorFee = withAuth(_claimFee);
