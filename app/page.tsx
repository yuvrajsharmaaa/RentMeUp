/**
 * Dashboard Home Page
 * 
 * Main landing page with:
 * - User's active reservations at the top
 * - Smart contract resource grid
 * - Real-time data from blockchain
 * - Filter and search capabilities
 * 
 * Features:
 * - Live data from CampusResourceNFT contract
 * - User-specific reservation dashboard
 * - Responsive grid layout (1-3 columns)
 * - Contract interaction through ResourceCard components
 * 
 * Note: For production, replace hardcoded resource IDs with dynamic loading
 * from contract events or subgraph.
 * 
 * @page
 */

'use client';

import { Box, Heading, Text, SimpleGrid, Flex, Badge, VStack } from '@chakra-ui/react';
import ResourceCard from '@/components/ResourceCard';
import UserReservations from '@/components/UserReservations';
import { useAccount } from 'wagmi';

/**
 * Dashboard Home Page Component
 * 
 * Renders the main dashboard with user reservations and all resources
 */
export default function DashboardPage() {
  const { isConnected } = useAccount();

  /**
   * Resource IDs to display
   * 
   * PRODUCTION TODO:
   * - Fetch resource IDs from contract events (ResourceCreated)
   * - Or use The Graph to index all resources
   * - Or maintain a backend API that tracks resource creation
   * 
   * For now, we'll display a few placeholder resource IDs (1-6)
   * Assuming resources were created during contract deployment
   */
  const resourceIds = [1, 2, 3, 4, 5, 6];

  return (
    <Box maxW="1400px" mx="auto">
      {/* Page Header */}
      <Box mb={8}>
        <Heading
          as="h1"
          size={{ base: 'xl', md: '2xl' }}
          mb={2}
          color="gray.800"
        >
          Campus Resources
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
          Reserve campus facilities, equipment, and spaces using blockchain technology
        </Text>
      </Box>

      {/* User Reservations Section - Only shown when wallet is connected */}
      {isConnected && (
        <Box mb={8}>
          <UserReservations />
        </Box>
      )}

      {/* Info Banner for Non-Connected Users */}
      {!isConnected && (
        <Box
          bg="blue.50"
          border="1px"
          borderColor="blue.200"
          borderRadius="lg"
          p={6}
          mb={8}
        >
          <VStack align="flex-start" gap={2}>
            <Heading size="md" color="blue.800">
              🔗 Connect Your Wallet
            </Heading>
            <Text color="blue.700">
              Connect your wallet to reserve resources and view your active reservations.
              Click "Connect Wallet" in the top right to get started.
            </Text>
            <Text fontSize="sm" color="blue.600">
              <strong>Features:</strong> Reserve resources • Track reservations • Gasless transactions
            </Text>
          </VStack>
        </Box>
      )}

      {/* Resources Grid */}
      <Box>
        <Heading
          as="h2"
          size={{ base: 'md', md: 'lg' }}
          mb={4}
          color="gray.700"
        >
          All Resources
        </Heading>
        
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          gap={{ base: 4, md: 6 }}
          w="full"
        >
          {resourceIds.map((resourceId) => (
            <ResourceCard key={resourceId} resourceId={resourceId} />
          ))}
        </SimpleGrid>
      </Box>

      {/* Instructions for First-Time Users */}
      <Box
        mt={12}
        bg="gray.50"
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        p={6}
      >
        <Heading size="sm" color="gray.800" mb={3}>
          📚 How to Use
        </Heading>
        <VStack align="flex-start" gap={2}>
          <Text fontSize="sm" color="gray.700">
            <strong>1. Connect Wallet:</strong> Click "Connect Wallet" in the header and select your wallet (MetaMask, etc.)
          </Text>
          <Text fontSize="sm" color="gray.700">
            <strong>2. Reserve Resource:</strong> Click "Reserve" on any available resource. This will stake a small amount of ETH.
          </Text>
          <Text fontSize="sm" color="gray.700">
            <strong>3. Use Resource:</strong> Once reserved, the resource is yours for up to 7 days.
          </Text>
          <Text fontSize="sm" color="gray.700">
            <strong>4. Release & Refund:</strong> Click "Release" when done to get your stake back.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
