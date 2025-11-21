/**
 * Root Layout Component (Server Component)
 * 
 * This is the main layout wrapper for the entire Next.js application.
 * It sets up the HTML structure and wraps content with necessary providers.
 * 
 * Key responsibilities:
 * 1. Set HTML lang attribute and metadata
 * 2. Wrap app with Providers (Wagmi, QueryClient, Chakra)
 * 3. Include global layout components (Header, Sidebar)
 * 4. Define responsive layout structure
 * 
 * Note: This is a Server Component by default in Next.js 14 App Router.
 * Client components (Providers, Header, Sidebar) are imported here.
 */

import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Box, Flex } from '@chakra-ui/react';
import './globals.css';

/**
 * Metadata configuration for SEO and social sharing
 * Updated in head tag automatically by Next.js
 */
export const metadata: Metadata = {
  title: 'Web3 Campus Resources Dashboard',
  description: 'A decentralized platform for managing and reserving campus resources using blockchain technology.',
  keywords: ['web3', 'campus', 'resources', 'blockchain', 'wagmi', 'ethereum'],
};

/**
 * RootLayout Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {/* Wrap with all providers (Web3, Query, Chakra) */}
        <Providers>
          {/* Header - Fixed at top */}
          <Header />
          
          {/* Main Layout - Sidebar + Content */}
          <Flex direction={{ base: 'column', md: 'row' }}>
            {/* Sidebar Navigation */}
            <Sidebar />
            
            {/* Main Content Area */}
            <Box
              as="main"
              flex="1"
              p={{ base: 4, md: 6 }}
              bg="gray.50"
              minH="calc(100vh - 73px)"
            >
              {children}
            </Box>
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
