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
import { injected } from 'wagmi/connectors';

/**
 * WalletConnect Project ID
 * 
 * Get your free project ID from: https://cloud.walletconnect.com
 * This is required for WalletConnect v2 integration.
 * 
 * To use WalletConnect:
 * 1. Create account at cloud.walletconnect.com
 * 2. Create a new project
 * 3. Copy the Project ID
 * 4. Add to .env.local: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

/**
 * Wallet Connectors Configuration
 * 
 * Using the injected connector which works with:
 * - MetaMask (browser extension)
 * - Coinbase Wallet (browser extension)
 * - Brave Wallet (built-in)
 * - Trust Wallet (browser extension)
 * - Any wallet that injects window.ethereum
 * 
 * The injected connector auto-detects all installed browser wallets
 * and allows users to choose which one to connect with.
 */
const connectors = [
  injected({
    shimDisconnect: true, // Clean disconnect behavior
  }),
];

/**
 * Wagmi Configuration Object
 * 
 * This configuration object is used by WagmiProvider to set up:
 * - Supported blockchain networks
 * - Available wallet connectors
 * - RPC endpoints for blockchain communication
 * - Storage for persisting connection state
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
  connectors,
  transports: {
    [polygon.id]: http(), // Polygon RPC endpoint
    [sepolia.id]: http(), // Sepolia RPC endpoint
  },
  ssr: true, // Enable server-side rendering support
  storage: createStorage({
    storage: cookieStorage, // Use cookies for persistence
  }),
});

/**
 * TypeScript Module Declaration
 * 
 * Extends Wagmi's type system to include our custom config.
 * This enables TypeScript autocomplete and type checking for:
 * - useAccount() hook
 * - useConnect() hook
 * - useDisconnect() hook
 * - useSwitchChain() hook
 * - All other Wagmi hooks
 */
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

/**
 * Helper function to check if wallet is installed
 * 
 * @returns {boolean} True if MetaMask or another Web3 wallet is detected
 */
export const isWalletInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).ethereum !== 'undefined';
};

/**
 * Helper function to get user-friendly chain name
 * 
 * @param {number} chainId - The blockchain network ID
 * @returns {string} Human-readable chain name
 */
export const getChainName = (chainId: number): string => {
  const chainNames: Record<number, string> = {
    [polygon.id]: 'Polygon',
    [sepolia.id]: 'Sepolia',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
};
