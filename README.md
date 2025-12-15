# Limitless SDK

> The official **JavaScript & TypeScript SDK** for integrating with the **Limitless** ecosystem — enabling token creation, liquidity management, creator fee claims, and Solana-based on-chain operations with minimal setup.

---

## Overview

The **Limitless SDK** provides developers with simple, type-safe methods to interact with the Limitless blockchain ecosystem.

**Key Features:**
- Secure API authentication with token-based auth
- Token creation and liquidity launch via Orca Whirlpool
- Creator fee claiming from liquidity positions 
- Real-time progress tracking with callbacks
- Built-in validation for all parameters
- Revenue sharing support for integrators and sales representatives
- Compatible with Custom RPC, Solana RPC, or custom endpoints

Built for modern frameworks like **React**, **Next.js**, and **Node.js**, it simplifies complex on-chain logic into developer-friendly APIs.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Authentication](#api-authentication)
  - [Generating Your API Key](#generating-your-api-key)
  - [Authentication Flow](#authentication-flow)
- [Core Functions](#core-functions)
  - [Initialize SDK](#initialize-sdk)
  - [Launch Token](#launch-token)
  - [Claim Creator Fee](#claim-creator-fee)
- [Advanced Usage](#advanced-usage)
  - [Progress Tracking](#progress-tracking)
  - [Fee Accounts (Revenue Sharing)](#fee-accounts-revenue-sharing)
  - [Custom RPC Endpoints](#custom-rpc-endpoints)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Requirements](#requirements)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Installation

Install the SDK via npm:

```bash
npm install @deaura/limitless-sdk
```

Or using yarn:

```bash
yarn add @deaura/limitless-sdk
```

The SDK is fully compatible with:
- **React / Next.js / Node.js** environments
- **TypeScript** & modern bundlers (Vite, Webpack, Turbopack)
- **Solana wallet adapters** (Phantom, Solflare, Backpack, etc.)

---

## Quick Start

```javascript
import { initSdk, launchToken, claimCreatorFee } from '@deaura/limitless-sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// 1. Initialize the SDK with your API key
await initSdk({ authToken: "limitless_live_your_api_key_here" });

// 2. Launch a token with liquidity
const launchResult = await launchToken({
  rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
  wallet: connectedWallet,
  metadata: {
    name: "My Token",
    symbol: "MTK",
    uri: "https://example.com/metadata.json"
  },
  tokenSupply: 1000000,
  liquidityAmount: 500,
  tickSpacing: 128,
  feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ",
  integratorAccount: null,
  salesRepAccount: null,
  onStep: (step) => console.log("Current step:", step)
});

if (launchResult.success) {
  console.log("Token Mint:", launchResult.data.tokenMint);
  console.log("Pool Address:", launchResult.data.poolAddress);
}

// 3. Claim creator fees from your liquidity position
const claimResult = await claimCreatorFee({
  rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
  wallet: connectedWallet,
  tokenMint: new PublicKey("YourTokenMintAddress"),
  whirlpool: new PublicKey("YourWhirlpoolAddress")
});

if (claimResult.success) {
  console.log("Rewards claimed! TX:", claimResult.data.signature);
}
```

---

## API Authentication

Every SDK call must be authenticated using a valid **Limitless API key**.

### Generating Your API Key

1. Log in to your [Limitless Dashboard](https://deaura.io)
2. Navigate to the **Limitless SDK** section
3. Click **Generate API Key**
4. Copy and securely store your key (valid for 1 year by default)
5. Never commit API keys to version control

### Authentication Flow

```javascript
import { initSdk } from '@deaura/limitless-sdk';
import React from 'react';

const App = () => {
  React.useEffect(() => {
    // Replace this with your generated API key from the Limitless dashboard
    const apiKey = "limitless_live_your_api_key_here";

    if (apiKey) {
      initSdk({ authToken: apiKey })
        .then((res) => {
          console.log('SDK initialized:', res);
        })
        .catch((err) => {
          console.error('SDK init failed:', err);
        });
    }
  }, []);

  return <div>Your App</div>;
};

export default App;
```

> **Security Note:** The authentication process ensures that all token operations are securely linked to your verified developer identity. Store API keys as environment variables and never expose them in client-side code.

**Best Practice:**
```javascript
// .env.local
NEXT_PUBLIC_LIMITLESS_API_KEY=limitless_live_your_api_key_here

// In your app
const apiKey = process.env.NEXT_PUBLIC_LIMITLESS_API_KEY;
await initSdk({ authToken: apiKey });
```

---

## Core Functions

### Initialize SDK

Initialize the SDK with your API key before making any other calls.

```javascript
import { initSdk } from '@deaura/limitless-sdk';

const initialize = async () => {
  try {
    const response = await initSdk({ 
      authToken: "limitless_live_your_api_key_here" 
    });
    
    if (response.success) {
      console.log('SDK initialized successfully');
    } else {
      console.error('SDK init failed:', response.error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

initialize();
```

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

---

### Launch Token

Create a new token mint, set metadata, and add liquidity automatically using the Orca Whirlpool protocol.

```javascript
import { launchToken } from '@deaura/limitless-sdk';
import { useWallet } from '@solana/wallet-adapter-react';

const LaunchTokenExample = () => {
  const wallet = useWallet();

  const handleLaunchToken = async () => {
    try {
      if (!wallet?.publicKey) {
        console.error("Please connect your wallet before launching a token.");
        return;
      }

      const params = {
        rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
        wallet, // The connected wallet adapter
        metadata: {
          name: "Limitless Token",
          symbol: "LMT",
          uri: "https://example.com/metadata.json", // Must be valid metadata JSON URI
        },
        tokenSupply: 1_000_000, // Total supply of the token
        liquidityAmount: 500,   // ORO tokens used as liquidity
        tickSpacing: 128,       // Whirlpool tick spacing (64, 128, or 256)
        feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ", // Orca fee tier address
        integratorAccount: null, // Optional: Partner integrator revenue share account
        salesRepAccount: null,   // Optional: Sales representative revenue share account
        onStep: (status) => {
          console.log("🔹 Step:", status);
          // Update UI with progress
          setCurrentStep(status);
        },
      };

      const response = await launchToken(params);

      if (!response.success) {
        console.error("❌ Launch failed:", response.error);
        toast.error(response.error);
        return;
      }

      console.log("✅ Token launched successfully!");
      console.log("Token Mint:", response.data.tokenMint);
      console.log("Pool Address:", response.data.poolAddress);
      console.log("Launch TX:", response.data.transactions.launch);
      console.log("Tick Config TX:", response.data.transactions.tickConfig);
      console.log("Liquidity TX:", response.data.transactions.liquidity);
    } catch (error) {
      console.error("❌ Unexpected error launching token:", error);
    }
  };

  return (
    <button onClick={handleLaunchToken}>
      Launch Token
    </button>
  );
};

export default LaunchTokenExample;
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rpcurl` | `string` | Yes | Solana RPC endpoint URL (Helius, Solana RPC, or custom) |
| `wallet` | `WalletAdapter` | Yes | Connected Solana wallet adapter instance |
| `metadata` | `object` | Yes | Token metadata (name, symbol, uri) |
| `metadata.name` | `string` | Yes | Token name (e.g., "My Token") |
| `metadata.symbol` | `string` | Yes | Token symbol/ticker (e.g., "MTK") |
| `metadata.uri` | `string` | Yes | Valid metadata JSON URI (must be http/https) |
| `tokenSupply` | `number` | Yes | Total token supply (max: 1,000,000,000) |
| `liquidityAmount` | `number` | Yes | ORO tokens used as liquidity (max: 1,000,000,000) |
| `tickSpacing` | `number` | Yes | Whirlpool tick spacing (64, 128, or 256) |
| `feeTierAddress` | `string` | Yes | Orca fee tier address |
| `integratorAccount` | `string \| null` | No | Partner integrator revenue share account |
| `salesRepAccount` | `string \| null` | No | Sales representative revenue share account |
| `onStep` | `function` | No | Callback for progress updates: `(step: string) => void` |

#### Response

```typescript
{
  success: true,
  data: {
    tokenMint: string,        // Token mint address
    poolAddress: string,      // Whirlpool address
    transactions: {
      launch: string,         // Launch transaction signature
      tickConfig: string | null, // Tick config transaction signature (if needed)
      liquidity: string       // Liquidity transaction signature
    }
  }
}

// Error response
{
  success: false,
  error: string              // Error message
}
```

#### Progress Steps

The `onStep` callback receives these status updates:
- `"Minting Token..."` - Token mint creation in progress
- `"Setting up Ticks..."` - Tick array initialization
- `"Adding Liquidity..."` - Adding liquidity to the pool

---

### Claim Creator Fee

Claim accumulated creator fees from your liquidity positions in the Orca Whirlpool.

```javascript
import { claimCreatorFee } from '@deaura/limitless-sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const ClaimRewardExample = () => {
  const wallet = useWallet();

  const handleClaimRewards = async () => {
    try {
      if (!wallet?.publicKey) {
        console.error("Please connect your wallet before claiming rewards.");
        return;
      }

      const params = {
        rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
        wallet,
        tokenMint: new PublicKey("YourTokenMintAddress"),
        whirlpool: new PublicKey("YourWhirlpoolAddress")
      };

      console.log("🔄 Claiming rewards...");

      const response = await claimCreatorFee(params);

      if (!response.success) {
        console.error("❌ Rewards claim failed:", response.error);
        return;
      }

      console.log("✅ Rewards claimed successfully!");
      console.log("Transaction:", response.data.signature);
      
    } catch (error) {
      console.error("❌ Unexpected error while claiming rewards:", error);
    }
  };

  return (
    <button onClick={handleClaimRewards}>
      Claim Creator Rewards
    </button>
  );
};

export default ClaimRewardExample;
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rpcurl` | `string` | Yes | Solana RPC endpoint URL |
| `wallet` | `WalletAdapter` | Yes | Connected Solana wallet adapter instance |
| `tokenMint` | `PublicKey` | Yes | Token mint address of the position |
| `whirlpool` | `PublicKey` | Yes | Whirlpool address associated with the position |

#### Response

```typescript
{
  success: true,
  data: {
    signature: string,         // Claim transaction signature
    claimantTokenA: PublicKey, // Token A account address
    claimantTokenB: PublicKey  // Token B account address
  }
}

// Error response
{
  success: false,
  error: string               // Error message
}
```

#### How Reward Claiming Works

When you call `claimCreatorFee()`:
1. The SDK fetches the latest position fee state from the Whirlpool
2. Calculates claimable amounts for both tokens in the pair
3. Prepares all Solana instructions required to withdraw available creator fees
4. Constructs a transaction and sends it to your connected wallet for signature
5. The user signs the transaction
6. Upon confirmation, rewards are transferred directly to the creator's wallet

> **Note:** Creator fees accumulate from trading activity in your liquidity pool. The more trading volume, the more fees you can claim.


### Fee Accounts (Revenue Sharing)

The SDK supports optional fee-routing addresses during token launch for revenue sharing:

#### Integrator Account
Wallet address of the platform or partner integrating the Limitless SDK. This account receives a small share of the protocol launch fee.

#### Sales Representative Account
Wallet address of the sales agent or representative who onboarded the creator. This account also receives a share of the protocol fee.

**Usage:**

```javascript
const params = {
  rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
  wallet,
  metadata: {
    name: "Limitless Token",
    symbol: "LMT",
    uri: "https://example.com/metadata.json",
  },
  tokenSupply: 1_000_000,
  liquidityAmount: 500,
  tickSpacing: 128,
  feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ",
  
  // Fee routing accounts (optional)
  integratorAccount: "YourIntegratorWalletAddress", // or null
  salesRepAccount: "YourSalesRepWalletAddress",     // or null
  
  onStep: (status) => console.log("Step:", status),
};

const response = await launchToken(params);
```

**Important Notes:**
- Both accounts are **optional** - pass `null` if not applicable
- The SDK automatically handles fee routing during launch
- No extra configuration required
- Fee distribution happens automatically on-chain

**Use Cases:**
- Platform integrations (integrator gets a share)
- Affiliate/referral programs (sales rep gets a share)
- Partner revenue sharing models

---

### Custom RPC Endpoints

The SDK supports any Solana RPC provider. You can use public endpoints or premium providers for better performance:

```javascript
// Solana Public RPC (Free, rate-limited)
rpcurl: "https://api.mainnet-beta.solana.com"

// Helius RPC (Recommended for production)
rpcurl: "https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY"

// QuickNode RPC
rpcurl: "https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY/"

// Alchemy RPC
rpcurl: "https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY"

// Custom RPC
rpcurl: "https://your-custom-rpc-endpoint.com"
```

## Requirements

- **Node.js**: >= 16.x
- **React** (optional): >= 17.x
- **Next.js** (optional): >= 12.x
- **Solana Wallet Adapter**: >= 0.15.x (for wallet integration)
- **TypeScript** (optional): >= 4.5.x

**Peer Dependencies:**
```json
{
  "@solana/web3.js": "^1.87.0",
  "@solana/wallet-adapter-base": "^0.9.0"
}
```

---

## Examples

### Complete React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { initSdk, launchToken } from '@deaura/limitless-sdk';
import { toast } from 'react-hot-toast';

const TokenLauncher = () => {
  const wallet = useWallet();
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  // Initialize SDK on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_LIMITLESS_API_KEY;
    if (apiKey) {
      initSdk({ authToken: apiKey })
        .then((res) => console.log('SDK initialized:', res))
        .catch((err) => console.error('SDK init failed:', err));
    }
  }, []);

  const handleLaunch = async () => {
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLaunching(true);
    setCurrentStep("Preparing...");

    try {
      const params = {
        rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
        wallet,
        metadata: {
          name: "My Awesome Token",
          symbol: "MAT",
          uri: "https://arweave.net/your-metadata-uri"
        },
        tokenSupply: 1_000_000,
        liquidityAmount: 500,
        tickSpacing: 128,
        feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ",
        integratorAccount: null,
        salesRepAccount: null,
        onStep: (step) => {
          console.log("Step:", step);
          setCurrentStep(step);
        },
      };

      const response = await launchToken(params);

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Token launched successfully!");
      console.log("Token Mint:", response.data.tokenMint);
      console.log("Pool Address:", response.data.poolAddress);
      
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLaunching(false);
      setCurrentStep("");
    }
  };

  return (
    <div>
      <button 
        onClick={handleLaunch} 
        disabled={isLaunching || !wallet?.publicKey}
      >
        {isLaunching ? currentStep : "Launch Token"}
      </button>
    </div>
  );
};

export default TokenLauncher;
```

### Claim Rewards Example

```typescript
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { claimCreatorFee } from '@deaura/limitless-sdk';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';

const ClaimRewards = ({ tokenMint, whirlpool }) => {
  const wallet = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsClaiming(true);

    try {
      const params = {
        rpcurl: process.env.NEXT_PUBLIC_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
        wallet,
        tokenMint: new PublicKey(tokenMint),
        whirlpool: new PublicKey(whirlpool)
      };

      const response = await claimCreatorFee(params);

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Rewards claimed successfully!");
      console.log("Transaction:", response.data.signature);
      
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <button 
      onClick={handleClaim} 
      disabled={isClaiming || !wallet?.publicKey}
    >
      {isClaiming ? "Claiming..." : "Claim Rewards"}
    </button>
  );
};

export default ClaimRewards;
```

## Support

Need help? We're here for you!

- **Documentation**: [deaura.io/docs/limitless-sdk](https://deaura.io/docs/limitless-sdk)
- **Discord**: [Join our community](https://discord.com/invite/7bfDtQxYDK)
- **Twitter**: [@deauraio](https://x.com/DeAuraio)
- **Email**: support@deaura.io
- **GitHub Issues**: [Report a bug](https://github.com/deaura/limitless-sdk/issues)

### Getting Help

When asking for help, please include:
1. SDK version (`npm list @deaura/limitless-sdk`)
2. Node.js version (`node -v`)
3. Error message or console logs
4. Code snippet showing the issue
5. Steps to reproduce the problem


---


Made with ❤️ by the **DeAura Labs** team