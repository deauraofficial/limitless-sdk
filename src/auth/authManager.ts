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

    //? set token on frontend
    // if (typeof window !== "undefined") {
    //   localStorage.setItem(TOKEN_KEY, authToken);
    // }

    return _user;
  } catch (err) {
    _authToken = null;
    _user = null;

    //? remvoe token fron frontend
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

export const ensureValidToken = async (): Promise<void> => {
  if (!_authToken) throw new Error("❌ SDK not initialized.");

  try {
    const res = await crossFetch(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: { Authorization: _authToken },
    });

    if (!res.ok) throw new Error("Token expired");
  } catch (err) {
    logoutSdk();
    throw new Error("❌ Token expired or invalid. Please reauthenticate.");
  }
};
