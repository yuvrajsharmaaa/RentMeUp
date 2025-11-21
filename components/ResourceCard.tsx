/**
 * ResourceCard Component
 * 
 * Displays a single campus resource in a card format showing:
 * - Resource name and category
 * - Availability status (available/reserved)
 * - Optional description and location
 * - Reserve button (with wallet connection check)
 * 
 * Props:
 * @param {Resource} resource - The resource object to display
 * 
 * Features:
 * - Status badge with color coding (green=available, red=reserved)
 * - Hover effects for better UX
 * - Responsive text sizing
 * - Disabled state for reserved items
 * - Wallet connection check before reservation
 * 
 * @component
 */

'use client';

import {
  Box,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  createToaster,
  Flex,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { Resource } from '@/types';

const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

/**
 * ResourceCard Props Interface
 */
interface ResourceCardProps {
  resource: Resource;
}

/**
 * ResourceCard Component
 * 
 * Renders a resource card with reservation functionality
 * Checks wallet connection before allowing reservation
 */
export default function ResourceCard({ resource }: ResourceCardProps) {
  const { isConnected } = useAccount();

  /**
   * Handle resource reservation
   * In production, this would call a smart contract or API
   */
  const handleReserve = () => {
    // Check wallet connection
    if (!isConnected) {
      toaster.create({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to reserve resources.',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    // Simulate reservation (replace with actual contract call)
    toaster.create({
      title: 'Reservation Initiated',
      description: `Processing reservation for ${resource.name}...`,
      type: 'info',
      duration: 3000,
    });

    // TODO: Implement actual reservation logic
    // Example: Call smart contract function
    // await reserveResource(resource.id);
  };

  /**
   * Determine if the Reserve button should be disabled
   */
  const isReserved = resource.status === 'reserved';

  /**
   * Get status badge color scheme based on availability
   */
  const getStatusColor = (status: string) => {
    return status === 'available' ? 'green' : 'red';
  };

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={5}
      transition="all 0.3s"
      _hover={{
        boxShadow: 'xl',
        transform: 'translateY(-4px)',
      }}
      border="1px"
      borderColor="gray.200"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Header Section: Name and Category */}
      <VStack align="stretch" gap={3} flex="1">
        {/* Resource Name */}
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          color="gray.800"
          lineClamp={2}
        >
          {resource.name}
        </Text>

        {/* Category and Status Badges */}
        <HStack gap={2} flexWrap="wrap">
          <Badge
            colorScheme="blue"
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {resource.category}
          </Badge>
          <Badge
            colorScheme={getStatusColor(resource.status)}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {resource.status.toUpperCase()}
          </Badge>
        </HStack>

        {/* Description */}
        {resource.description && (
          <Text
            fontSize="sm"
            color="gray.600"
            lineClamp={3}
            lineHeight="1.6"
          >
            {resource.description}
          </Text>
        )}

        {/* Location */}
        {resource.location && (
          <Flex align="center" gap={1}>
            <Text fontSize="sm" color="gray.500">
              📍 {resource.location}
            </Text>
          </Flex>
        )}
      </VStack>

      {/* Reserve Button */}
      <Button
        mt={4}
        colorScheme="brand"
        size="md"
        w="full"
        onClick={handleReserve}
        disabled={isReserved}
        _disabled={{
          opacity: 0.6,
          cursor: 'not-allowed',
        }}
      >
        {isReserved ? 'Reserved' : 'Reserve'}
      </Button>
    </Box>
  );
}
