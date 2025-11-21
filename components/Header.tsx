/**
 * Header Component
 * 
 * Top navigation bar displaying:
 * - Application branding
 * - Wallet connection status
 * - Network information
 * - Connect/Disconnect button
 * 
 * Uses Wagmi hooks for Web3 functionality:
 * - useAccount: Get connected wallet address
 * - useConnect: Trigger wallet connection
 * - useDisconnect: Disconnect wallet
 * - useNetwork: Get current network info
 * 
 * Responsive design:
 * - Mobile: Stacked layout, smaller text
 * - Desktop: Horizontal layout with full info
 * 
 * @component
 */

'use client';

import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  HStack,
  Badge,
  createToaster,
} from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi';

const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

/**
 * Header Component
 * 
 * Displays app title and wallet connection controls
 * Automatically shows connection status and network info
 */
export default function Header() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();

  /**
   * Handle wallet connection
   * Uses the first available connector (usually injected wallet like MetaMask)
   */
  const handleConnect = () => {
    try {
      const connector = connectors[0]; // Use first available connector
      if (connector) {
        connect({ connector });
      } else {
        toaster.create({
          title: 'No Wallet Found',
          description: 'Please install MetaMask or another Web3 wallet.',
          type: 'warning',
          duration: 4000,
        });
      }
    } catch (error) {
      toaster.create({
        title: 'Connection Error',
        description: 'Failed to connect wallet. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = () => {
    disconnect();
    toaster.create({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully.',
      type: 'info',
      duration: 3000,
    });
  };

  /**
   * Format wallet address for display
   * Shows first 6 and last 4 characters: 0x1234...5678
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={{ base: 4, md: 6 }}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex
        maxW="1400px"
        mx="auto"
        align="center"
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 0 }}
      >
        {/* App Title */}
        <Heading
          size={{ base: 'md', md: 'lg' }}
          color="brand.600"
          fontWeight="bold"
        >
          🎓 Campus Resources Dashboard
        </Heading>

        {/* Wallet Connection Section */}
        <HStack gap={4} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
          {/* Network Badge - Shows current network if connected */}
          {isConnected && chain && (
            <Badge
              colorScheme={chain.id === 1 ? 'green' : 'orange'}
              fontSize={{ base: 'xs', md: 'sm' }}
              px={3}
              py={1}
              borderRadius="full"
            >
              {chain.name}
            </Badge>
          )}

          {/* Wallet Address Display */}
          {isConnected && address && (
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="medium"
              color="gray.700"
              display={{ base: 'none', sm: 'block' }}
            >
              {formatAddress(address)}
            </Text>
          )}

          {/* Connect/Disconnect Button */}
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            colorScheme={isConnected ? 'red' : 'brand'}
            size={{ base: 'sm', md: 'md' }}
            variant={isConnected ? 'outline' : 'solid'}
          >
            {isConnected ? 'Disconnect' : 'Connect Wallet'}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
