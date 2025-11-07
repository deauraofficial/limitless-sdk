import { PublicKey, Connection } from '@solana/web3.js';

declare const getDummyData: () => {
    name: string;
    chain: string;
    address: string;
};

interface AuthUser {
    userId: string;
    email: string;
    role?: string;
    [key: string]: any;
}
declare const initSdk: ({ authToken }: {
    authToken: string;
}) => Promise<AuthUser | null>;
declare const restoreSdk: () => Promise<AuthUser | null>;
declare const getAuthToken: () => string;
declare const getCurrentUser: () => AuthUser;
declare const isInitialized: () => boolean;
declare const logoutSdk: () => void;
declare const ensureValidToken: () => Promise<void>;

declare const getSolBalance: (publicKey: PublicKey, connection: Connection) => Promise<number>;

declare const transferSol: (wallet: any, to: string | PublicKey, amount: number) => Promise<string>;

interface LaunchTokenParams {
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
    onStep?: (state: string) => void;
}

declare const launchToken: ({ rpcurl, wallet, metadata, tokenSupply, liquidityAmount, tickSpacing, feeTierAddress, onStep, }: LaunchTokenParams) => Promise<{
    success: boolean;
    error: any;
    data?: undefined;
} | {
    success: boolean;
    data: any;
    error?: undefined;
}>;

export { type AuthUser, type LaunchTokenParams, ensureValidToken, getAuthToken, getCurrentUser, getDummyData, getSolBalance, initSdk, isInitialized, launchToken, logoutSdk, restoreSdk, transferSol };
