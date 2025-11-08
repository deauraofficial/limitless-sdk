import { withAuth } from "../auth/withAuth";
import { runLaunchFlow } from "./contract/token";
import { LaunchTokenParams } from "./types";

const _launchToken = async ({
  rpcurl,
  wallet,
  metadata,
  tokenSupply,
  liquidityAmount,
  tickSpacing,
  feeTierAddress,
  onStep,
}: LaunchTokenParams) => {
  try {
    if (!wallet) throw new Error("Wallet is required");
    if (!metadata?.name || !metadata?.symbol || !metadata?.uri)
      throw new Error("Metadata (name, symbol, uri) is required");

    const result = await runLaunchFlow(
      rpcurl,
      wallet,
      metadata,
      tokenSupply,
      liquidityAmount,
      onStep || (() => {}),
      tickSpacing,
      feeTierAddress
    );

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ launchToken failed:", error);
    return { success: false, error: error.message || error };
  }
};

export const launchToken = withAuth(_launchToken);
