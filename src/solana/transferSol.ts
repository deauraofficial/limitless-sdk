import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { withAuth } from "../auth/withAuth";

const _transferSol = async (
  token: string,
  wallet: any, // Phantom wallet from useWallet()
  to: string | PublicKey,
  amount: number,
  rpc: string
): Promise<string> => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("❌ Wallet not connected");
  }

  const recipient = typeof to === "string" ? new PublicKey(to) : to;
  const connection = new Connection(
    rpc || "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  const sender = wallet.publicKey;
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

  // ✅ Step 1: Check sender balance
  const balance = await connection.getBalance(sender);
  if (balance < lamports) {
    throw new Error(
      `❌ Insufficient balance. Need ${amount} SOL, have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`
    );
  }

  // ✅ Step 2: Create transaction
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports,
    })
  );

  tx.feePayer = sender;
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  try {
    const txid = await wallet.sendTransaction(tx, connection, {
      preflightCommitment: "confirmed",
    });

    // ✅ Wait for confirmation
    await connection.confirmTransaction(
      {
        signature: txid,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    return txid;
  } catch (err: any) {
    console.error("❌ Transfer failed:", err);
    throw new Error(`❌ Transfer failed: ${err?.message || "Unknown error"}`);
  }
};

export const transferSol = withAuth(_transferSol);
