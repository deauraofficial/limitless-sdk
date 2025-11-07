# 🚀 Limitless SDK


> The official **JavaScript & TypeScript SDK** for integrating with the **Limitless** ecosystem — enabling token creation, liquidity management, and Solana-based on-chain operations with minimal setup.

---

## ✨ Overview

The **Limitless SDK** provides developers with simple, type-safe methods to interact with the Limitless blockchain ecosystem.

**Key Features:**
- 🔐 Secure API authentication
- 🪙 Token creation and liquidity launch via Orca Whirlpool
- 💰 SOL balance queries and transfers
- 📊 Real-time progress tracking with callbacks
- 🎯 Built-in validation for all parameters
- ⚡ Compatible with Custom RPC, Solana RPC, or custom endpoints

Built for modern frameworks like **React**, **Next.js**, and **Node.js**, it simplifies complex on-chain logic into developer-friendly APIs.

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Authentication](#-api-authentication)
- [Core Functions](#-core-functions)
  - [Initialize SDK](#initialize-sdk)
  - [Launch Token](#launch-token)
- [Requirements](#-requirements)
- [Support](#-support)

---

## 📦 Installation

Install the SDK via npm:

```bash
npm install @deaura/limitless-sdk
```

The SDK is fully compatible with:
- 🧩 **React / Next.js / Node.js** environments
- ⚙️ **TypeScript** & modern bundlers (Vite, Webpack)
- 💼 **Solana wallet adapters** (Phantom, Solflare, Backpack, etc.)

---

## 🚀 Quick Start

```javascript
import { initSdk, launchToken } from '@deaura/limitless-sdk';
import { useWallet } from '@solana/wallet-adapter-react';

// 1. Initialize the SDK with your API key
await initSdk({ authToken: "limitless_live_your_api_key_here" });

// 2. Launch a token with liquidity
const result = await launchToken({
  rpcurl: "https://devnet.helius-rpc.com/?api-key=your_helius_key",
  wallet: connectedWallet,
  metadata: {
    name: "My Token",
    symbol: "MTK",
    uri: "https://example.com/metadata.json"
  },
  tokenSupply: 1000000,
  liquidityAmount: 500,
  tickSpacing: 128,
  feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ"
});
```

---

## 🔐 API Authentication

Every SDK call must be authenticated using a valid **Limitless API key**.

### Generating Your API Key

1. Log in to your [Limitless Ecosystem](https://deaura.io)
2. Navigate to the limitless SDL section
3. Generate a new API key (valid for 1 year by default)
4. Copy and securely store your key

### Authentication Flow

```javascript
import { initSdk } from '@deaura/limitless-sdk';
import React from 'react';

React.useEffect(() => {
  // Replace this with your generated API key from the Limitless dashboard
  const apiKey = "limitless_live_your_api_key_here";

  if (apiKey) {
    initSdk({ authToken: apiKey })
      .then((res) => console.log('✅ SDK initialized:', res))
      .catch((err) => console.error('❌ SDK init failed:', err));
  }
}, []);
```

> 🔐 **Security Note:** The authentication process ensures that all token operations are securely linked to your verified developer identity. Never commit API keys to version control.

---

## 🛠️ Core Functions

### Initialize SDK

Initialize the SDK with your API key before making any other calls.

```javascript
import { initSdk } from '@deaura/limitless-sdk';

const initialize = async () => {
  try {
    const response = await initSdk({ 
      authToken: "limitless_live_your_api_key_here" 
    });
    console.log('✅ SDK initialized:', response);
  } catch (error) {
    console.error('❌ SDK init failed:', error);
  }
};
```

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
        console.error("❌ Please connect your wallet before launching a token.");
        return;
      }

      const params = {
        rpcurl: "https://devnet.helius-rpc.com/?api-key=your_helius_key",
        wallet, // ✅ The connected wallet adapter
        metadata: {
          name: "Limitless Token",
          symbol: "LMT",
          uri: "https://example.com/metadata.json", // Must be valid metadata JSON URI
        },
        tokenSupply: 1_000_000, // ✅ Total supply of the token
        liquidityAmount: 500,   // ✅ ORO tokens used as liquidity
        tickSpacing: 128,       // ✅ Whirlpool tick spacing
        feeTierAddress: "G319n1BPjeXjAfheDxYe8KWZM7FQhQCJerWRK2nZYtiJ", // Example fee tier (ORCA fee tiers)
        onStep: (status) => console.log("🪄 Step:", status), // Optional callback for progress updates
      };

      const response = await launchToken(params);

      if (!response.success) {
        console.error("❌ Launch failed:", response.error);
        return;
      }

      console.log("✅ Token launched successfully:", response.data);
    } catch (error) {
      console.error("🔥 Unexpected error launching token:", error);
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
| `rpcurl` | `string` | ✅ | Solana RPC endpoint URL (Helius, Solana RPC, or custom) |
| `wallet` | `WalletAdapter` | ✅ | Connected Solana wallet adapter instance |
| `metadata` | `object` | ✅ | Token metadata (name, symbol, uri) |
| `metadata.name` | `string` | ✅ | Token name |
| `metadata.symbol` | `string` | ✅ | Token symbol (ticker) |
| `metadata.uri` | `string` | ✅ | Valid metadata JSON URI |
| `tokenSupply` | `number` | ✅ | Total token supply |
| `liquidityAmount` | `number` | ✅ | ORO tokens used as liquidity |
| `tickSpacing` | `number` | ✅ | Whirlpool tick spacing (64, 128, or 256) |
| `feeTierAddress` | `string` | ✅ | Orca fee tier address |
| `onStep` | `function` | ❌ | Optional callback for progress updates |

---

---

## 📋 Requirements

- **Node.js**: >= 16.x
- **React** (optional): >= 17.x
- **Solana Wallet Adapter**: >= 0.15.x (for wallet integration)
- **TypeScript** (optional): >= 4.5.x

---

## 📚 Advanced Usage

### Progress Tracking

Use the `onStep` callback to track token launch progress:

```javascript
await launchToken({
  // ... other params
  onStep: (status) => {
    console.log('Current step:', status);
    // Update UI with progress
  }
});
```

### Custom RPC Endpoints

The SDK supports any Solana RPC provider:

```javascript
// Helius
rpcurl: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"

// QuickNode
rpcurl: "https://YOUR_ENDPOINT.quiknode.pro/YOUR_TOKEN/"

// Solana Public RPC
rpcurl: "https://api.mainnet-beta.solana.com"
```

### Error Handling

Always wrap SDK calls in try-catch blocks:

```javascript
try {
  const result = await launchToken(params);
  if (!result.success) {
    // Handle expected errors
    console.error('Launch failed:', result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

---

## 🤝 Support

- **Documentation**: [deaura.io/docs/limitless-sdk](https://deaura.io/docs/limitless-sdk)
- **Discord**: [Join our community](https://discord.com/invite/7bfDtQxYDK)
- **Twitter**: [@deauraio](https://x.com/DeAuraio)

---

Made with ❤️ by the DeAura Labs team