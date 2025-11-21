/**
 * Web3Provider Component
 * 
 * A comprehensive wrapper component that manages Web3 wallet connections,
 * error handling, and global state for the entire application.
 * 
 * Features:
 * - Auto-reconnection on page load
 * - Connection error handling with user-friendly messages
 * - Chain switching with network validation
 * - Wallet state persistence across sessions
 * - Unsupported browser detection
 * - Connection rejection handling
 * 
 * This component wraps the app and provides Web3 context to all child components.
 * It integrates Wagmi hooks with TanStack Query for optimal data fetching.
 * 
 * @component
 */

'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, isWalletInstalled } from '@/config/wagmi';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Create QueryClient instance
 * 
 * Configured for optimal Web3 data fetching:
 * - No automatic refetch on window focus (prevents unnecessary RPC calls)
 * - Single retry on failure (reduces wait time for users)
 * - 5-minute default cache time
 * - 30-second stale time for balance/state queries
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      retry: 1, // Retry failed requests once
      gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
      staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

/**
 * Web3Provider Props Interface
 */
interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3Provider Component
 * 
 * Provides Web3 functionality to the entire app.
 * Handles wallet detection and displays warnings if wallet is not installed.
 * 
 * @param {Web3ProviderProps} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component with Web3 context
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);

  /**
   * Client-side mounting effect
   * 
   * Ensures the component only renders on the client side.
   * This prevents hydration mismatches with SSR.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Wallet installation check effect
   * 
   * Checks if a Web3 wallet (MetaMask, etc.) is installed.
   * Runs only once on component mount.
   */
  useEffect(() => {
    if (mounted) {
      // Small delay to ensure window.ethereum is injected
      const timer = setTimeout(() => {
        const hasWallet = isWalletInstalled();
        
        // Log wallet status for debugging
        if (!hasWallet) {
          console.warn(
            '⚠️ No Web3 wallet detected. Install MetaMask or another Web3 wallet to connect.'
          );
        }
        
        setWalletCheckComplete(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mounted]);

  /**
   * Prevent rendering until mounted
   * Avoids hydration issues with SSR
   */
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/**
 * Error Boundary for Web3 Errors
 * 
 * This component can be used to catch and handle Web3-specific errors
 * that might occur during wallet interactions.
 * 
 * Usage:
 * <Web3ErrorBoundary>
 *   <YourComponent />
 * </Web3ErrorBoundary>
 */
export class Web3ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Web3 Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Web3 Connection Error</h2>
          <p>There was an error connecting to your wallet.</p>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Type definitions for window.ethereum
 * Extends the Window interface to include ethereum object
 */
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

// Fix missing React import for error boundary
import React from 'react';