import { Connection, PublicKey } from "@solana/web3.js";
import { withAuth } from "./auth/withAuth";

/**
 * Get SOL balance of a wallet
 * @param publicKey Solana wallet public key
 * @param connection Solana connection object
 * @returns balance in SOL
 */

const _getSolBalance = async (
  token: string, // ✅ injected automatically via withAuth
  publicKey: PublicKey,
  connection: Connection
): Promise<number> => {
  if (!publicKey) throw new Error("Public key is required");
  if (!connection) throw new Error("Connection is required");

  const lamports = await connection.getBalance(publicKey);
  return lamports / 1e9; // Convert to SOL
};

export const getSolBalance = withAuth(_getSolBalance);
