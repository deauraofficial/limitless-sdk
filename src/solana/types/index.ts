import { PublicKey, Transaction, Connection } from "@solana/web3.js";
export interface SDKWallet {
  publicKey: PublicKey | null;
  sendTransaction?: (
    tx: Transaction,
    connection: Connection,
    options?: {
      skipPreflight?: boolean;
      preflightCommitment?: string;
    }
  ) => Promise<string>;

  signTransaction?: (tx: Transaction) => Promise<Transaction>;

  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
}

export interface LaunchTokenParams {
  rpcurl: string;
  wallet: any;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
  tokenSupply: number;
  liquidityAmount: number;
  tickSpacing: number;
  feeTierAddress: string;
  integratorAccount: string | null;
  salesRepAccount: string | null;
  onStep?: (state: string) => void;
}

export interface ClaimFeeParams {
  rpcurl: string;
  wallet: any;
  tokenMint: PublicKey;
  whirlpool: PublicKey;
}

export type SDKResponse<T = any> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };
