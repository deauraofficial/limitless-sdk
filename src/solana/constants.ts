import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "./abi/deaura.json";
import { address } from "@solana/kit";

import {
  VNX_TOKEN_MINT,
  GOLDC_TOKEN_MINT,
  ASSOCIATED_TOKEN_PROGRAM_ID as ASSOCIATED_TOKEN_PROGRAM_ID_VALUE,
  ORCA_WHIRLPOOL_PROGRAM_ID as ORCA_WHIRLPOOL_PROGRAM_ID_VALUE,
  TOKEN_METADATA_PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID_VALUE,
  TREASURY_ADDRESS as TREASURY_ADDRESS_VALUE,
  MEMO_PROGRAM as MEMO_PROGRAM_VALUE,
  METADATA_UPDATE_AUTH as METADATA_UPDATE_AUTH_VALUE,
  WHIRLPOOLS_CONFIG_PUBKEY as WHIRLPOOLS_CONFIG_PUBKEY_VALUE,
} from "./env";

export const METADATA_UPDATE_AUTH_ADDRESS = address(METADATA_UPDATE_AUTH_VALUE);

// ✅ Tokens
export const TOKEN_X_MINT = new PublicKey(VNX_TOKEN_MINT as string); // VNX
export const TOKEN_Y_MINT = new PublicKey(GOLDC_TOKEN_MINT as string); // GoldC
export const IDL = idl;

export const admin = anchor.web3.Keypair.generate();
export const treasuery = anchor.web3.Keypair.generate();

// ✅ PDAs
export const VAULT_AUTHORITY = Buffer.from("vault_authority");
export const GOLDC_MINT = Buffer.from("goldc_mint");
export const VNX_VAULT_PREFIX = Buffer.from("vnx_vault");
export const GLOBAL_STATE = Buffer.from("global_state");
export const USER_STATE_PREFIX = Buffer.from("user_state");

// ✅ PublicKey wrappers (keeping same constant names)
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  ASSOCIATED_TOKEN_PROGRAM_ID_VALUE
);

export const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey(
  ORCA_WHIRLPOOL_PROGRAM_ID_VALUE
);

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  TOKEN_METADATA_PROGRAM_ID_VALUE
);

export const TREASURY_ADDRESS = new PublicKey(TREASURY_ADDRESS_VALUE);

export const MEMO_PROGRAM = new PublicKey(MEMO_PROGRAM_VALUE);

export const METADATA_UPDATE_AUTH = new PublicKey(METADATA_UPDATE_AUTH_VALUE);

export const WHIRLPOOLS_CONFIG_PUBKEY = new PublicKey(
  WHIRLPOOLS_CONFIG_PUBKEY_VALUE
);

// ✅ Confirm helper
export const confirm = async (
  promise: Promise<string>,
  provider = anchor.AnchorProvider.env()
): Promise<string> => {
  const signature = await promise;
  const block = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({ signature, ...block });
  return signature;
};
