import BN from "bn.js";

/**
 * Converts a token amount to BN smallest unit (e.g., lamports)
 */
export function tokenToBN(amount: number | string, decimals: number = 9): BN {
  const amountNumber = Number(amount);
  if (isNaN(amountNumber)) {
    throw new Error("❌ Amount must be a valid number");
  }

  // toFixed ensures no float precision issues
  const smallestUnitsStr = (amountNumber * Math.pow(10, decimals)).toFixed(0);

  // Validate it is still a number string
  if (!/^\d+$/.test(smallestUnitsStr)) {
    throw new Error("❌ Amount results in invalid smallest units");
  }

  return new BN(smallestUnitsStr);
}
