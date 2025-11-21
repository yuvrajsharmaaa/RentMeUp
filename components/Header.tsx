'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Badge,
  HStack,
} from '@chakra-ui/react';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@/components/ui/menu';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { polygon, sepolia } from 'wagmi/chains';
import { toaster } from '@/components/ui/toaster';

/**
 * Error message constants for user-friendly notifications
 */
const ERROR_MESSAGES = {
  NETWORK_SWITCH: 'Failed to switch network. Please try again.',
  WALLET_CONNECT: 'Failed to connect wallet. Please try again.',
  UNSUPPORTED_CHAIN: 'Unsupported network. Please switch to Polygon or Sepolia.',
  USER_REJECTED: 'Connection request was rejected.',
  WALLET_NOT_INSTALLED: 'No wallet detected. Please install MetaMask or another Web3 wallet.',
};

/**
 * Header Component
 * 
 * Main navigation header with Web3 wallet integration.
 * 
 * Features:
 * - Wallet connection/disconnection with injected provider (MetaMask, etc.)
 * - Network switching between Polygon and Sepolia
 * - Wallet address display with truncation
 * - Error handling with user notifications
 * - Responsive design
 * 
 * Hooks Used:
 * - useAccount: Get connection status and wallet address
 * - useConnect: Handle wallet connections
 * - useDisconnect: Handle wallet disconnections
 * - useSwitchChain: Switch between blockchain networks
 * - useChainId: Get current connected network ID
 */
export default function Header() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, error: switchError } = useSwitchChain();
  const chainId = useChainId();
  
  // State for managing UI
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Ensure this only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Format wallet address for display
   * Truncates address to show first 6 and last 4 characters
   * Example: 0x1234...5678
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Get human-readable chain name from chain ID
   */
  const getChainName = (id: number) => {
    switch (id) {
      case polygon.id:
        return 'Polygon';
      case sepolia.id:
        return 'Sepolia';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get color scheme for chain badge
   */
  const getChainColor = (id: number) => {
    switch (id) {
      case polygon.id:
        return 'purple';
      case sepolia.id:
        return 'orange';
      default:
        return 'gray';
    }
  };

  /**
   * Handle network switching
   * 
   * Switches the connected wallet to the specified blockchain network.
   * Shows success/error notifications.
   * 
   * @param targetChainId - The chain ID to switch to (137 for Polygon, 11155111 for Sepolia)
   */
  const handleChainSwitch = async (targetChainId: number) => {
    try {
      if (!isConnected) {
        toaster.create({
          title: 'Not Connected',
          description: 'Please connect your wallet first.',
          type: 'warning',
          duration: 3000,
        });
        return;
      }

      await switchChain({ chainId: targetChainId });
      
      toaster.create({
        title: 'Network Switched',
        description: `Successfully switched to ${getChainName(targetChainId)}`,
        type: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Chain switch error:', err);
      
      toaster.create({
        title: 'Network Switch Failed',
        description: err?.message || ERROR_MESSAGES.NETWORK_SWITCH,
        type: 'error',
        duration: 5000,
      });
    }
  };

  /**
   * Handle wallet connection
   * 
   * Connects to the user's wallet using the injected connector.
   * Handles various error scenarios:
   * - User rejection
   * - No wallet installed
   * - Connection errors
   */
  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // Check if any wallet is installed
      if (!connectors || connectors.length === 0) {
        toaster.create({
          title: 'No Wallet Found',
          description: ERROR_MESSAGES.WALLET_NOT_INSTALLED,
          type: 'error',
          duration: 5000,
        });
        return;
      }

      // Use the first available connector (injected)
      const connector = connectors[0];
      
      await connect({ connector });

      toaster.create({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet',
        type: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Connection error:', err);
      
      // Handle user rejection
      if (err?.message?.includes('rejected') || err?.message?.includes('denied')) {
        toaster.create({
          title: 'Connection Rejected',
          description: ERROR_MESSAGES.USER_REJECTED,
          type: 'warning',
          duration: 3000,
        });
      } else {
        toaster.create({
          title: 'Connection Failed',
          description: err?.message || ERROR_MESSAGES.WALLET_CONNECT,
          type: 'error',
          duration: 5000,
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = () => {
    disconnect();
    
    toaster.create({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
      type: 'info',
      duration: 3000,
    });
  };

  // Show connection errors if any
  useEffect(() => {
    if (connectError) {
      toaster.create({
        title: 'Connection Error',
        description: connectError.message || ERROR_MESSAGES.WALLET_CONNECT,
        type: 'error',
        duration: 5000,
      });
    }
  }, [connectError]);

  // Show network switch errors if any
  useEffect(() => {
    if (switchError) {
      toaster.create({
        title: 'Network Switch Error',
        description: switchError.message || ERROR_MESSAGES.NETWORK_SWITCH,
        type: 'error',
        duration: 5000,
      });
    }
  }, [switchError]);

  // Don't render until client-side (prevents hydration errors)
  if (!isClient) {
    return (
      <Box
        as="header"
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
        px={{ base: 4, md: 6 }}
        py={4}
      >
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="brand.600">
            🎓 Campus Resources
          </Heading>
          <Flex gap={3} align="center">
            <Button variant="outline" colorScheme="gray" disabled>
              Loading...
            </Button>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      as="header"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      px={{ base: 4, md: 6 }}
      py={4}
    >
      <Flex justify="space-between" align="center">
        {/* Logo/Title */}
        <Heading size="lg" color="brand.600">
          🎓 Campus Resources
        </Heading>

        {/* Wallet Connection UI */}
        <Flex gap={3} align="center">
          {isConnected && (
            <>
              {/* Network Switcher Dropdown */}
              <MenuRoot positioning={{ placement: 'bottom-end' }}>
                <MenuTrigger asChild>
                  <Button variant="outline" colorScheme={getChainColor(chainId)} size="sm">
                    🌐 {getChainName(chainId)}
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem
                    value={polygon.id.toString()}
                    onClick={() => handleChainSwitch(polygon.id)}
                  >
                    Polygon
                  </MenuItem>
                  <MenuItem
                    value={sepolia.id.toString()}
                    onClick={() => handleChainSwitch(sepolia.id)}
                  >
                    Sepolia Testnet
                  </MenuItem>
                </MenuContent>
              </MenuRoot>

              {/* Connected Address Display */}
              <Badge colorScheme="green" fontSize="sm" px={3} py={2}>
                <HStack gap={2}>
                  <Text>🔗</Text>
                  <Text fontFamily="mono">{formatAddress(address!)}</Text>
                </HStack>
              </Badge>

              {/* Disconnect Button */}
              <Button
                onClick={handleDisconnect}
                colorScheme="red"
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </>
          )}

          {!isConnected && (
            /* Connect Wallet Button */
            <Button
              onClick={handleConnect}
              colorScheme="blue"
              size="sm"
              loading={isConnecting}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
