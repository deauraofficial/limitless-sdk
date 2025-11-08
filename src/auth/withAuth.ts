import { ensureValidToken, getAuthToken } from "./authManager";

/**
 * Wraps SDK methods that require authentication.
 * Works with both (token, ...args) and (...args) function signatures.
 */
export function withAuth<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const token = getAuthToken();
    await ensureValidToken();

    // If the wrapped function expects a token, inject it
    if (fn.length > args.length) {
      // @ts-ignore — safe runtime injection
      return fn(token, ...args);
    }

    // Otherwise, just call it normally
    return fn(...args);
  };
}
