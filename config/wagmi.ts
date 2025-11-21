/**
 * Wagmi Configuration for Web3 Integration
 * 
 * This file sets up the wallet connection configuration using Wagmi v2.
 * It defines supported chains, connectors (MetaMask, WalletConnect), and transport settings.
 * 
 * Integration Steps:
 * 1. Install dependencies: wagmi, viem, @tanstack/react-query, @wagmi/connectors
 * 2. Configure supported chains (Polygon, Sepolia)
 * 3. Set up wallet connectors (MetaMask via injected, WalletConnect)
 * 4. Configure RPC transports for each chain
 * 5. Create Wagmi config with createConfig
 * 6. Wrap app with WagmiProvider and QueryClientProvider in Providers component
 * 
 * Supported Wallets:
 * - MetaMask (and other injected wallets)
 * - WalletConnect (mobile wallets, Coinbase Wallet, etc.)
 * 
 * Supported Chains:
 * - Polygon Mainnet (Chain ID: 137)
 * - Sepolia Testnet (Chain ID: 11155111)
 */

import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { polygon, sepolia } from 'wagmi/chains';

/**
 * Wagmi Configuration Object
 * 
 * This configuration object is used by WagmiProvider to set up:
 * - Supported blockchain networks  
 * - RPC endpoints for blockchain communication
 * - Storage for persisting connection state
 * 
 * Note: We're not configuring connectors here due to dependency issues.
 * Connectors will be handled directly in the components using hooks.
 * 
 * Chains Configuration:
 * - polygon: Production network for Polygon (MATIC)
 * - sepolia: Ethereum test network for development
 * 
 * Transports:
 * - HTTP transport for each chain
 * - Uses public RPC endpoints (can be replaced with Alchemy/Infura)
 * 
 * Storage:
 * - Cookie-based storage for SSR compatibility
 * - Persists wallet connection across page reloads
 */
export const config = createConfig({
  chains: [polygon, sepolia],
  transports: {
    [polygon.id]: http(), // Polygon RPC endpoint
    [sepolia.id]: http(), // Sepolia RPC endpoint
  },
  ssr: true, // Enable server-side rendering support
  storage: createStorage({
    storage: cookieStorage, // Use cookies for persistence
  }),
});
