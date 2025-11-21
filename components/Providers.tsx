/**
 * Providers Component
 * 
 * This component wraps the entire application with necessary providers:
 * 1. Web3Provider - Manages Web3 wallet connectivity (Wagmi + QueryClient)
 * 2. ChakraProvider - Provides Chakra UI theme and components
 * 
 * All providers are marked as client components ('use client') since they
 * require browser APIs and state management.
 * 
 * Provider Hierarchy:
 * - Web3Provider wraps WagmiProvider and QueryClientProvider internally
 * - ChakraProvider handles UI theming and components
 * 
 * @component
 */

'use client';

import { ChakraProvider, Toaster } from '@chakra-ui/react';
import { Web3Provider } from '@/components/Web3Provider';
import { theme } from '@/styles/theme';
import { toaster } from '@/components/ui/toaster';

/**
 * Providers Component
 * 
 * Wraps children with all necessary context providers for the app.
 * Order matters: Web3 (Wagmi + Query) → Chakra UI
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <ChakraProvider value={theme}>
        {children}
        <Toaster toaster={toaster}>
          {(toast) => toast.title}
        </Toaster>
      </ChakraProvider>
    </Web3Provider>
  );
}
