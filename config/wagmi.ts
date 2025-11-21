/**
 * Wagmi Configuration for Web3 Integration
 * 
 * This file sets up the wallet connection configuration using Wagmi v2.
 * It defines supported chains and transport settings.
 * 
 * Setup Steps:
 * 1. Install dependencies: wagmi, viem, @tanstack/react-query
 * 2. Configure chains (mainnet, sepolia, etc.)
 * 3. Set up transports for blockchain communication
 * 4. Create Wagmi config with createConfig
 * 5. Wrap app with WagmiProvider and QueryClientProvider
 * 
 * Note: For wallet connections, we use injected wallets (MetaMask, etc.)
 * through the browser extension detection.
 */

import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

/**
 * Wagmi Configuration
 * 
 * Chains: Ethereum Mainnet and Sepolia testnet
 * Transports: HTTP RPC endpoints for each chain
 * 
 * Connectors are auto-detected from installed browser wallets
 */
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

/**
 * Declare module for Wagmi config type
 * This provides TypeScript autocomplete for useAccount, useConnect, etc.
 */
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
