import { withAuth } from "../auth/withAuth";
import { runLaunchFlow } from "./contract/token";
import { LaunchTokenParams, SDKResponse } from "./types";

const _launchToken = async (
  params: LaunchTokenParams
): Promise<SDKResponse> => {
  const {
    rpcurl,
    wallet,
    metadata,
    tokenSupply,
    liquidityAmount,
    onStep,
    tickSpacing,
    feeTierAddress,
    integratorAccount,
    salesRepAccount,
  } = params;

  if (!wallet) {
    return { success: false, error: "Wallet is required" };
  }
  if (!rpcurl) {
    return { success: false, error: "RPC URL is required" };
  }
  if (!metadata?.name || !metadata?.symbol || !metadata?.uri) {
    return {
      success: false,
      error: "Metadata (name, symbol, uri) is required",
    };
  }

  try {
    const result = await runLaunchFlow(
      rpcurl,
      wallet,
      metadata,
      tokenSupply,
      liquidityAmount,
      onStep || (() => {}),
      tickSpacing,
      feeTierAddress,
      integratorAccount,
      salesRepAccount
    );

    return result;
  } catch (error: any) {
    console.error("❌ launchToken failed:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const launchToken = withAuth(_launchToken);
