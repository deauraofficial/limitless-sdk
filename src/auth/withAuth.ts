import { ensureValidToken, getAuthToken } from "./authManager";

/**
 * High-order function to wrap SDK methods that require authentication.
 * Example:
 *   export const transferSol = withAuth(_transferSol);
 */
export function withAuth<T extends any[], R>(
  fn: (token: string, ...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const token = getAuthToken();
    await ensureValidToken();
    return fn(token, ...args);
  };
}
