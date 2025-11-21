# Web3 Integration Guide

Complete guide for understanding and extending the Web3 wallet integration in this application.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Wallet Connectors](#wallet-connectors)
- [Chain Management](#chain-management)
- [Error Handling](#error-handling)
- [State Management](#state-management)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Extending](#extending)

---

## 🎯 Overview

This application uses **Wagmi v2** for comprehensive Web3 wallet integration, providing:

### Features
✅ Multiple wallet support (MetaMask, WalletConnect, others)  
✅ Multi-chain support (Polygon, Sepolia)  
✅ Network switching with user prompts  
✅ Comprehensive error handling  
✅ Connection state persistence  
✅ SSR-compatible implementation  
✅ Mobile wallet support via WalletConnect  

### Tech Stack
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: Low-level Ethereum library
- **TanStack Query**: Data fetching and caching
- **@wagmi/connectors**: Wallet connector implementations

---

## 🏗 Architecture

### Component Hierarchy

```
app/layout.tsx
└── Providers
    └── Web3Provider
        ├── WagmiProvider (wallet state)
        └── QueryClientProvider (data caching)
            └── ChakraProvider (UI)
                └── Your App Components
```

### Key Files

| File | Purpose |
|------|---------|
| `config/wagmi.ts` | Wagmi configuration, chains, connectors |
| `components/Web3Provider.tsx` | Provider wrapper with error boundary |
| `components/Providers.tsx` | Main providers composition |
| `components/Header.tsx` | Wallet UI, connection controls |
| `types/index.ts` | TypeScript types for Web3 |

---

## 🔌 Wallet Connectors

### Supported Connectors

#### 1. MetaMask Connector

**Primary desktop wallet connector**

```typescript
import { metaMask } from '@wagmi/connectors';

metaMask({
  shimDisconnect: true, // Cleanly handle disconnects
})
```

**Features:**
- Auto-detects MetaMask installation
- Optimized for MetaMask browser extension
- Handles MetaMask-specific events
- Provides best UX for MetaMask users

**Installation Check:**
```typescript
const isMetaMaskInstalled = typeof window.ethereum?.isMetaMask !== 'undefined';
```

#### 2. Injected Connector

**Generic connector for any browser wallet**

```typescript
import { injected } from '@wagmi/connectors';

injected({
  shimDisconnect: true,
})
```

**Supports:**
- Coinbase Wallet
- Brave Wallet
- Trust Wallet (desktop)
- Any wallet injecting `window.ethereum`

#### 3. WalletConnect

**QR code connector for mobile wallets**

```typescript
import { walletConnect } from '@wagmi/connectors';

walletConnect({
  projectId: 'your_project_id',
  showQrModal: true,
  qrModalOptions: {
    themeMode: 'light',
  },
})
```

**Setup:**
1. Get Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```
3. Connector auto-configures if ID is present

**Supports:**
- 300+ mobile wallets
- Trust Wallet, Rainbow, Argent, etc.
- Cross-device connections
- QR code modal

---

## 🌐 Chain Management

### Configured Chains

```typescript
import { polygon, sepolia } from 'wagmi/chains';

const SUPPORTED_CHAINS = [polygon, sepolia];
```

### Chain Information

| Chain | ID | Purpose | RPC |
|-------|----|---------| -----|
| Polygon | 137 | Production | Public RPC |
| Sepolia | 11155111 | Testing | Public RPC |

### Adding Custom Chains

```typescript
import { defineChain } from 'viem';

const myCustomChain = defineChain({
  id: 12345,
  name: 'My Network',
  network: 'my-network',
  nativeCurrency: {
    decimals: 18,
    name: 'Token',
    symbol: 'TKN',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mynetwork.com'],
    },
    public: {
      http: ['https://rpc.mynetwork.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.mynetwork.com',
    },
  },
});

// Add to config
export const config = createConfig({
  chains: [polygon, sepolia, myCustomChain],
  // ...
});
```

### Network Switching

Users can switch networks via the Header dropdown:

```typescript
const { switchChain } = useSwitchChain();

// Switch to Polygon
await switchChain({ chainId: 137 });

// Switch to Sepolia
await switchChain({ chainId: 11155111 });
```

**Error Handling:**
- User rejection → Notification
- Chain not added → Prompt to add
- Unsupported chain → Error message

---

## ⚠️ Error Handling

### Error Types

The application handles these common wallet errors:

| Error | Cause | Handling |
|-------|-------|----------|
| `User rejected` | User cancelled request | Show friendly message |
| `Connector not found` | Wallet not installed | Prompt installation |
| `Chain not configured` | Unsupported network | Guide to switch |
| `User denied` | Wallet request denied | Suggest retry |
| `Already processing` | Pending request exists | Wait or cancel |
| `Unsupported chain` | Wrong network | Show switch prompt |

### Error Messages

Defined in `components/Header.tsx`:

```typescript
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  'User rejected': {
    title: 'Connection Cancelled',
    description: 'You rejected the connection request.',
  },
  // ... more errors
};
```

### Custom Error Handling

```typescript
import { type Web3Error } from '@/types';

const handleWeb3Error = (error: Error): Web3Error => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('rejected')) {
    return {
      type: 'user_rejected',
      message: 'User cancelled the request',
      originalError: error,
    };
  }
  
  // ... handle other errors
  
  return {
    type: 'unknown_error',
    message: error.message,
    originalError: error,
  };
};
```

---

## 📦 State Management

### Wagmi Hooks

#### useAccount
```typescript
const { 
  address,      // '0x1234...'
  isConnected,  // true/false
  chain,        // { id: 137, name: 'Polygon', ... }
  status,       // 'connected' | 'disconnected' | 'connecting'
} = useAccount();
```

#### useConnect
```typescript
const { 
  connect,       // Function to trigger connection
  connectors,    // Available wallet connectors
  error,         // Connection error if any
  isPending,     // Connection in progress
  isSuccess,     // Connection successful
} = useConnect();

// Connect with specific connector
connect({ connector: connectors[0] });
```

#### useDisconnect
```typescript
const { 
  disconnect,    // Function to disconnect
  isPending,     // Disconnect in progress
} = useDisconnect();

disconnect();
```

#### useSwitchChain
```typescript
const { 
  switchChain,   // Function to switch network
  chains,        // Available chains
  isPending,     // Switch in progress
  error,         // Switch error if any
} = useSwitchChain();

// Switch to Polygon
await switchChain({ chainId: 137 });
```

#### useChainId
```typescript
const chainId = useChainId(); // Current chain ID
```

### Connection Persistence

Uses cookie storage for SSR compatibility:

```typescript
import { createStorage, cookieStorage } from 'wagmi';

storage: createStorage({
  storage: cookieStorage,
})
```

**Benefits:**
- Works with SSR
- Persists across page reloads
- Automatic reconnection
- Secure cookie-based storage

---

## 💻 Usage Examples

### Connect Wallet

```typescript
'use client';

import { useConnect, useConnectors } from 'wagmi';

function ConnectButton() {
  const { connect } = useConnect();
  const connectors = useConnectors();
  
  const handleConnect = () => {
    // Find MetaMask connector
    const metaMask = connectors.find(c => 
      c.name.toLowerCase().includes('metamask')
    );
    
    // Connect with MetaMask or first available
    connect({ connector: metaMask || connectors[0] });
  };
  
  return <button onClick={handleConnect}>Connect</button>;
}
```

### Display Wallet Address

```typescript
import { useAccount } from 'wagmi';

function WalletAddress() {
  const { address, isConnected } = useAccount();
  
  if (!isConnected) return <p>Not connected</p>;
  
  const formatted = `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  
  return <p>Connected: {formatted}</p>;
}
```

### Switch Network

```typescript
import { useSwitchChain } from 'wagmi';
import { polygon } from 'wagmi/chains';

function NetworkSwitcher() {
  const { switchChain, isPending } = useSwitchChain();
  
  const handleSwitch = async () => {
    try {
      await switchChain({ chainId: polygon.id });
      console.log('Switched to Polygon');
    } catch (error) {
      console.error('Failed to switch:', error);
    }
  };
  
  return (
    <button onClick={handleSwitch} disabled={isPending}>
      {isPending ? 'Switching...' : 'Switch to Polygon'}
    </button>
  );
}
```

### Read Blockchain Data

```typescript
import { useAccount, useBalance } from 'wagmi';

function WalletBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address,
  });
  
  if (isLoading) return <p>Loading...</p>;
  
  return (
    <p>
      Balance: {balance?.formatted} {balance?.symbol}
    </p>
  );
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### Wallet Won't Connect

**Symptoms:** Connection fails or hangs

**Solutions:**
1. Check if MetaMask is installed
2. Unlock wallet in browser extension
3. Check browser console for errors
4. Try refreshing the page
5. Clear browser cache and cookies

#### Wrong Network Error

**Symptoms:** "Unsupported network" message

**Solutions:**
1. Click network switcher in header
2. Select correct network (Polygon/Sepolia)
3. Approve network switch in wallet
4. If chain not added, approve add network request

#### Connection Persists After Disconnect

**Symptoms:** Wallet auto-reconnects

**Solutions:**
1. Clear cookies
2. Disconnect in wallet extension
3. Clear browser cache
4. Use private/incognito mode for testing

#### WalletConnect QR Not Showing

**Symptoms:** No QR modal appears

**Solutions:**
1. Check Project ID is set in `.env.local`
2. Verify `NEXT_PUBLIC_` prefix on env var
3. Restart dev server after adding env var
4. Check browser console for WalletConnect errors

---

## 🚀 Extending

### Add New Wallet Connector

```typescript
// config/wagmi.ts
import { coinbaseWallet } from '@wagmi/connectors';

const connectors = [
  metaMask(),
  injected(),
  coinbaseWallet({
    appName: 'Campus Dashboard',
  }),
  // WalletConnect...
];
```

### Add Custom RPC Endpoints

```typescript
import { http } from 'wagmi';

export const config = createConfig({
  chains: [polygon, sepolia],
  transports: {
    [polygon.id]: http('https://polygon-rpc.com'),
    [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR-KEY'),
  },
});
```

### Add Transaction Support

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function SendTransaction() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  const handleSend = () => {
    writeContract({
      address: '0x...',
      abi: CONTRACT_ABI,
      functionName: 'transfer',
      args: [recipient, amount],
    });
  };
  
  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? 'Sending...' : isSuccess ? 'Sent!' : 'Send'}
    </button>
  );
}
```

---

## 📚 Resources

- **Wagmi Docs**: https://wagmi.sh
- **Viem Docs**: https://viem.sh
- **WalletConnect**: https://cloud.walletconnect.com
- **MetaMask Docs**: https://docs.metamask.io
- **Polygon Docs**: https://docs.polygon.technology

---

**Last Updated**: November 2025  
**Wagmi Version**: v2.x  
**Maintainer**: Development Team
