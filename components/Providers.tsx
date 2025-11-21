/**
 * Web3 Providers Component
 * 
 * This component wraps the entire application with necessary providers:
 * 1. WagmiProvider - Enables Web3 wallet connectivity hooks
 * 2. QueryClientProvider - Required by Wagmi for data fetching
 * 3. ChakraProvider - Provides Chakra UI theme and components
 * 
 * All providers are marked as client components ('use client') since they
 * require browser APIs and state management.
 * 
 * @component
 */

'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { config } from '@/config/wagmi';
import { theme } from '@/styles/theme';

/**
 * Create a new QueryClient instance for React Query
 * Configured with sensible defaults for caching and refetching
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Providers Component
 * 
 * Wraps children with all necessary context providers for the app.
 * Order matters: Wagmi → QueryClient → Chakra
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={theme}>
          {children}
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
