/**
 * Type definitions for Campus Resources Dashboard
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * Includes both resource management types and Web3/wallet integration types.
 */

/**
 * Resource Status - Indicates availability of a campus resource
 */
export type ResourceStatus = 'available' | 'reserved';

/**
 * Resource Category - Classification of campus resources
 */
export type ResourceCategory = 'Lab' | 'Equipment' | 'Room' | 'Vehicle' | 'Other';

/**
 * Resource Interface - Represents a campus resource
 * 
 * @property id - Unique identifier for the resource
 * @property name - Display name of the resource
 * @property category - Type/category of the resource
 * @property status - Current availability status
 * @property description - Optional detailed description
 * @property location - Optional physical location
 */
export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  status: ResourceStatus;
  description?: string;
  location?: string;
}

/**
 * Navigation Item Interface - Represents a sidebar navigation link
 * 
 * @property label - Display text for the navigation item
 * @property href - Route path
 * @property icon - Optional icon name/component identifier
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

/**
 * Web3 Connection Error Types
 * Common error types that can occur during wallet interactions
 */
export type Web3ErrorType =
  | 'user_rejected'
  | 'connector_not_found'
  | 'chain_not_configured'
  | 'unsupported_chain'
  | 'connection_timeout'
  | 'unknown_error';

/**
 * Web3 Connection Error Interface
 * 
 * @property type - The type of error that occurred
 * @property message - Human-readable error message
 * @property originalError - The original error object from the wallet
 */
export interface Web3Error {
  type: Web3ErrorType;
  message: string;
  originalError?: Error;
}

/**
 * Wallet Connection State Interface
 * 
 * Represents the current state of the wallet connection
 * 
 * @property isConnected - Whether a wallet is connected
 * @property address - The connected wallet address (if connected)
 * @property chainId - The current blockchain network ID
 * @property chainName - Human-readable name of the current chain
 * @property isConnecting - Whether a connection is in progress
 * @property error - Any error that occurred during connection
 */
export interface WalletConnectionState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  chainName?: string;
  isConnecting: boolean;
  error?: Web3Error;
}

/**
 * Supported Chain Configuration
 * 
 * @property id - Chain ID (e.g., 137 for Polygon)
 * @property name - Display name (e.g., "Polygon")
 * @property rpcUrl - RPC endpoint URL
 * @property explorerUrl - Block explorer URL
 * @property nativeCurrency - Native token information
 */
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Wallet Connector Type
 * Different wallet types supported by the app
 */
export type ConnectorType = 'metamask' | 'walletconnect' | 'injected';

/**
 * Transaction Status
 * Possible states for blockchain transactions
 */
export type TransactionStatus = 
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';
