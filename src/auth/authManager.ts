import { fetch as crossFetch } from "cross-fetch";

export interface AuthUser {
  userId: string;
  email: string;
  role?: string;
  [key: string]: any;
}

let _authToken: string | null = null;
let _user: AuthUser | null = null;

const VALIDATE_TOKEN_URL =
  "https://beta-be.deaura.io/api/v1/sdk/validate-api-key";

const TOKEN_KEY = "goldc_sdk_token";

export const initSdk = async ({ authToken }: { authToken: string }) => {
  _authToken = authToken;

  try {
    const res = await crossFetch(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey: authToken }),
    });

    if (!res.ok) {
      _authToken = null;
      _user = null;
      throw new Error("❌ Token validation failed. Please log in again.");
    }

    _user = await res.json();

    // ✅ Optionally persist token on frontend
    // if (typeof window !== "undefined") {
    //   localStorage.setItem(TOKEN_KEY, authToken);
    // }

    return _user;
  } catch (err) {
    _authToken = null;
    _user = null;

    // ✅ Optionally clear stored token
    // if (typeof window !== "undefined") {
    //   localStorage.removeItem(TOKEN_KEY);
    // }

    throw err;
  }
};

export const restoreSdk = async (): Promise<AuthUser | null> => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    return await initSdk({ authToken: token });
  } catch {
    return null;
  }
};

export const getAuthToken = (): string => {
  if (!_authToken)
    throw new Error(
      "❌ SDK not initialized. Call initSdk() with a valid token."
    );
  return _authToken;
};

export const getCurrentUser = (): AuthUser => {
  if (!_user)
    throw new Error("❌ User not validated. Ensure initSdk() has completed.");
  return _user;
};

export const isInitialized = (): boolean => !!_authToken;

export const logoutSdk = (): void => {
  _authToken = null;
  _user = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * ✅ Ensures the SDK token is valid.
 * Makes a POST request with { apiKey } in body as expected by backend.
 */
export const ensureValidToken = async (): Promise<void> => {
  if (!_authToken) throw new Error("❌ SDK not initialized.");

  try {
    const res = await crossFetch(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: _authToken, // optional, for compatibility
      },
      body: JSON.stringify({ apiKey: _authToken }), // ✅ backend expects this
    });

    if (!res.ok) {
      console.error("❌ Token validation failed:", res.status);
      logoutSdk();
      throw new Error("❌ Token expired or invalid. Please reauthenticate.");
    }

    const data = await res.json().catch(() => null);
    if (data && data.success === false) {
      logoutSdk();
      throw new Error("❌ Invalid API key.");
    }

    // ✅ Token is valid, continue
    return;
  } catch (err) {
    logoutSdk();
    console.error("❌ Token validation error:", err);
    throw new Error("❌ Token expired or invalid. Please reauthenticate.");
  }
};
