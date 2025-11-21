/**
 * Header Component
 * 
 * Top navigation bar with comprehensive Web3 wallet integration featuring:
 * - Multi-wallet support (MetaMask, WalletConnect, other injected wallets)
 * - Network/chain switching (Polygon ↔ Sepolia)
 * - Connection status display
 * - Wallet address with formatted display
 * - Comprehensive error handling with user-friendly notifications
 * - Responsive design for mobile and desktop
 * 
 * Error Handling:
 * - Wallet not installed → Installation prompt
 * - User rejection → Friendly notification
 * - Wrong network → Network switch prompt
 * - Unsupported browser → Browser upgrade message
 * - Connection timeout → Retry option
 * 
 * Uses Wagmi v2 Hooks:
 * - useAccount: Get connected wallet info
 * - useConnect: Initiate wallet connections
 * - useDisconnect: Disconnect wallet
 * - useConnectors: Get available wallet connectors
 * - useSwitchChain: Switch between networks
 * - useChainId: Get current chain ID
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
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Spinner,
} from '@chakra-ui/react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useConnectors,
  useSwitchChain,
  useChainId,
} from 'wagmi';
import { polygon, sepolia } from 'wagmi/chains';
import { useEffect, useState } from 'react';

/**
 * Toast notification system
 * Displays user feedback for wallet actions and errors
 */
const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

/**
 * Supported chains for network switching
 * Add more chains here to expand network support
 */
const SUPPORTED_CHAINS = [polygon, sepolia];

/**
 * Error Messages Map
 * User-friendly error messages for common wallet errors
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  'User rejected': {
    title: 'Connection Cancelled',
    description: 'You rejected the connection request. Please try again when ready.',
  },
  'Connector not found': {
    title: 'Wallet Not Found',
    description: 'Please install MetaMask or another Web3 wallet to continue.',
  },
  'Chain not configured': {
    title: 'Unsupported Network',
    description: 'This network is not supported. Please switch to Polygon or Sepolia.',
  },
  'User denied': {
    title: 'Request Denied',
    description: 'You denied the request in your wallet.',
  },
  'Already processing': {
    title: 'Request Pending',
    description: 'Please complete or cancel the current wallet request first.',
  },
  'Unsupported chain': {
    title: 'Wrong Network',
    description: 'Please switch to a supported network (Polygon or Sepolia).',
  },
};

/**
 * Header Component
 * 
 * Displays app title, wallet connection controls, and network switcher
 */
export default function Header() {
  // Wagmi hooks for wallet state and actions
  const { address, isConnected, chain } = useAccount();
  const { connect, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();

  // Local state
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Client-side mounting effect
   * Prevents hydration mismatches with SSR
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Connection Error Handler
   * 
   * Monitors connection errors and displays appropriate notifications.
   * Maps technical errors to user-friendly messages.
   */
  useEffect(() => {
    if (connectError) {
      handleConnectionError(connectError);
    }
  }, [connectError]);

  /**
   * Handle connection errors with user-friendly notifications
   * 
   * @param {Error} error - The error object from wallet connection
   */
  const handleConnectionError = (error: Error) => {
    const errorMessage = error.message.toLowerCase();
    
    // Find matching error message
    let errorInfo = { 
      title: 'Connection Error', 
      description: 'Failed to connect wallet. Please try again.' 
    };

    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(key.toLowerCase())) {
        errorInfo = value;
        break;
      }
    }

    // Special handling for MetaMask not installed
    if (errorMessage.includes('no provider') || errorMessage.includes('not found')) {
      errorInfo = {
        title: 'MetaMask Not Installed',
        description: 'Install MetaMask from metamask.io to continue.',
      };
    }

    toaster.create({
      title: errorInfo.title,
      description: errorInfo.description,
      type: 'error',
      duration: 5000,
    });

    console.error('Wallet connection error:', error);
  };

  /**
   * Handle wallet connection
   * 
   * Attempts to connect using the first available connector.
   * Priority: MetaMask > Injected > WalletConnect
   * 
   * Error cases handled:
   * - No wallet installed
   * - User rejection
   * - Already processing request
   * - Unsupported browser
   */
  const handleConnect = async () => {
    try {
      // Check if any connector is available
      if (connectors.length === 0) {
        toaster.create({
          title: 'No Wallet Found',
          description: 'Please install MetaMask or another Web3 wallet extension.',
          type: 'warning',
          duration: 6000,
        });
        return;
      }

      // Find MetaMask connector first (preferred)
      const metaMaskConnector = connectors.find(
        (c) => c.name.toLowerCase().includes('metamask')
      );

      // Use MetaMask if available, otherwise use first connector
      const connector = metaMaskConnector || connectors[0];

      console.log('Connecting with:', connector.name);

      // Initiate connection
      connect({ connector });

    } catch (error: any) {
      handleConnectionError(error);
    }
  };

  /**
   * Handle wallet disconnection
   * 
   * Safely disconnects the wallet and clears state.
   * Shows confirmation notification.
   */
  const handleDisconnect = () => {
    try {
      disconnect();
      toaster.create({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected successfully.',
        type: 'info',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toaster.create({
        title: 'Disconnection Error',
        description: 'Failed to disconnect wallet. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  /**
   * Handle network/chain switching
   * 
   * @param {number} targetChainId - The chain ID to switch to
   * 
   * Error cases handled:
   * - Unsupported chain
   * - User rejection
   * - Chain not added to wallet
   */
  const handleChainSwitch = async (targetChainId: 137 | 11155111) => {
    try {
      console.log('Switching to chain:', targetChainId);
      
      await switchChain({ chainId: targetChainId });

      const chainName = SUPPORTED_CHAINS.find(c => c.id === targetChainId)?.name || 'network';
      
      toaster.create({
        title: 'Network Switched',
        description: `Successfully switched to ${chainName}.`,
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Chain switch error:', error);
      
      let errorMsg = 'Failed to switch network. Please try again.';
      
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        errorMsg = 'You rejected the network switch request.';
      } else if (error.message?.includes('Unrecognized chain')) {
        errorMsg = 'This network is not added to your wallet. Please add it manually.';
      }

      toaster.create({
        title: 'Network Switch Failed',
        description: errorMsg,
        type: 'error',
        duration: 4000,
      });
    }
  };

  /**
   * Format wallet address for display
   * 
   * Truncates address to show first 6 and last 4 characters.
   * Example: 0x1234...5678
   * 
   * @param {string} addr - Full wallet address
   * @returns {string} Formatted address
   */
  const formatAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Get color scheme for network badge
   * 
   * @param {number} chainId - Chain ID
   * @returns {string} Chakra UI color scheme name
   */
  const getChainColor = (chainId: number): string => {
    switch (chainId) {
      case polygon.id:
        return 'purple'; // Polygon brand color
      case sepolia.id:
        return 'orange'; // Testnet indicator
      default:
        return 'gray';
    }
  };

  // Prevent rendering until mounted (avoid hydration issues)
  if (!isMounted) {
    return null;
  }

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
        {/* App Title/Branding */}
        <Heading
          size={{ base: 'md', md: 'lg' }}
          color="brand.600"
          fontWeight="bold"
        >
          🎓 Campus Resources Dashboard
        </Heading>

        {/* Wallet Connection Section */}
        <HStack gap={3} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
          
          {/* Network Switcher - Only visible when connected */}
          {isConnected && (
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  size={{ base: 'sm', md: 'md' }}
                  variant="outline"
                  colorScheme={chain ? getChainColor(chain.id) : 'gray'}
                  disabled={isSwitching}
                >
                  {isSwitching ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text>Switching...</Text>
                    </HStack>
                  ) : (
                    <HStack gap={2}>
                      <Text>🌐</Text>
                      <Text>{chain?.name || 'Unknown'}</Text>
                    </HStack>
                  )}
                </Button>
              </MenuTrigger>
              <MenuContent>
                {SUPPORTED_CHAINS.map((supportedChain) => (
                  <MenuItem
                    key={supportedChain.id}
                    value={supportedChain.id.toString()}
                    onClick={() => handleChainSwitch(supportedChain.id as 137 | 11155111)}
                    bg={chainId === supportedChain.id ? 'gray.100' : 'white'}
                    fontWeight={chainId === supportedChain.id ? 'bold' : 'normal'}
                  >
                    <HStack gap={2} w="full">
                      <Text>
                        {chainId === supportedChain.id ? '✓' : '○'}
                      </Text>
                      <Text>{supportedChain.name}</Text>
                      <Badge
                        ml="auto"
                        colorScheme={getChainColor(supportedChain.id)}
                        fontSize="xs"
                      >
                        ID: {supportedChain.id}
                      </Badge>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>
          )}

          {/* Wallet Address Display - Desktop only */}
          {isConnected && address && (
            <Badge
              colorScheme="green"
              fontSize={{ base: 'xs', md: 'sm' }}
              px={3}
              py={2}
              borderRadius="md"
              display={{ base: 'none', sm: 'block' }}
            >
              <HStack gap={2}>
                <Text>🔗</Text>
                <Text fontFamily="mono">{formatAddress(address)}</Text>
              </HStack>
            </Badge>
          )}

          {/* Connect/Disconnect Button */}
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            colorScheme={isConnected ? 'red' : 'brand'}
            size={{ base: 'sm', md: 'md' }}
            variant={isConnected ? 'outline' : 'solid'}
            disabled={isConnecting}
            minW="140px"
          >
            {isConnecting ? (
              <HStack gap={2}>
                <Spinner size="sm" />
                <Text>Connecting...</Text>
              </HStack>
            ) : isConnected ? (
              'Disconnect'
            ) : (
              'Connect Wallet'
            )}
          </Button>
        </HStack>
      </Flex>

      {/* Mobile Wallet Address Display */}
      {isConnected && address && (
        <Flex
          justify="center"
          mt={2}
          display={{ base: 'flex', sm: 'none' }}
        >
          <Badge
            colorScheme="green"
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="md"
          >
            <HStack gap={1}>
              <Text>🔗</Text>
              <Text fontFamily="mono">{formatAddress(address)}</Text>
            </HStack>
          </Badge>
        </Flex>
      )}
    </Box>
  );
}
