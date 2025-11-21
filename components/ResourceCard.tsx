/**
 * ResourceCard Component
 * 
 * Displays a single campus resource with smart contract integration:
 * - Real-time reservation status from blockchain
 * - Reserve/Release buttons with contract calls
 * - Loading states during transactions
 * - Error handling with toast notifications
 * - Countdown timer for active reservations
 * - Gasless transaction support via Biconomy
 * 
 * Props:
 * @param {number} resourceId - The on-chain resource ID
 * 
 * Features:
 * - Live data from CampusResourceNFT contract
 * - Automatic refetch after transactions
 * - User-specific actions (release only if you reserved)
 * - Responsive design with mobile-friendly UI
 * 
 * @component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useAccount, useChainId } from 'wagmi';
import { toaster } from '@/components/ui/toaster';
import { ProgressBar } from '@/components/ui/progress';
import { 
  useResourceDetails, 
  useReserveResource, 
  useReleaseResource,
  useReservationStake 
} from '@/hooks/useContract';
import { 
  getCategoryColor, 
  formatRemainingTime,
  DEFAULT_RESERVATION_DURATION 
} from '@/config/contract';
import { isBiconomyEnabled } from '@/utils/biconomy';

/**
 * ResourceCard Props Interface
 */
interface ResourceCardProps {
  resourceId: number;
}

/**
 * ResourceCard Component with Smart Contract Integration
 * 
 * Fetches resource data from blockchain and provides reserve/release functionality
 */
export default function ResourceCard({ resourceId }: ResourceCardProps) {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Fetch resource data from contract
  const { resource, isUserReserver, isLoading, error, refetch } = useResourceDetails(resourceId);
  const { stake } = useReservationStake();
  
  // Contract write hooks
  const { reserve, isPending: isReserving, isSuccess: reserveSuccess, error: reserveError } = useReserveResource();
  const { release, isPending: isReleasing, isSuccess: releaseSuccess, error: releaseError } = useReleaseResource();
  
  // Local state for countdown timer
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [useGasless, setUseGasless] = useState(false);

  // Check if gasless transactions are available
  useEffect(() => {
    setUseGasless(isBiconomyEnabled(chainId));
  }, [chainId]);

  // Update countdown timer every second
  useEffect(() => {
    if (resource?.isReserved && resource.remainingTime) {
      setTimeRemaining(resource.remainingTime);
      
      const interval = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resource]);

  // Handle successful reservation
  useEffect(() => {
    if (reserveSuccess) {
      toaster.create({
        title: 'Reservation Successful!',
        description: `${resource?.name} has been reserved.`,
        type: 'success',
        duration: 5000,
      });
      // Refetch resource data to update UI
      setTimeout(() => refetch(), 2000);
    }
  }, [reserveSuccess, resource, refetch]);

  // Handle successful release
  useEffect(() => {
    if (releaseSuccess) {
      toaster.create({
        title: 'Resource Released',
        description: `${resource?.name} is now available. Your stake has been returned.`,
        type: 'success',
        duration: 5000,
      });
      // Refetch resource data to update UI
      setTimeout(() => refetch(), 2000);
    }
  }, [releaseSuccess, resource, refetch]);

  // Handle reservation errors
  useEffect(() => {
    if (reserveError) {
      toaster.create({
        title: 'Reservation Failed',
        description: reserveError.message || 'Failed to reserve resource. Please try again.',
        type: 'error',
        duration: 5000,
      });
    }
  }, [reserveError]);

  // Handle release errors
  useEffect(() => {
    if (releaseError) {
      toaster.create({
        title: 'Release Failed',
        description: releaseError.message || 'Failed to release resource. Please try again.',
        type: 'error',
        duration: 5000,
      });
    }
  }, [releaseError]);

  /**
   * Handle resource reservation
   * Calls smart contract with stake amount
   */
  const handleReserve = async () => {
    // Check wallet connection
    if (!isConnected || !userAddress) {
      toaster.create({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to reserve resources.',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    // Check if resource exists
    if (!resource?.exists) {
      toaster.create({
        title: 'Resource Not Found',
        description: 'This resource does not exist.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    try {
      toaster.create({
        title: 'Processing Reservation',
        description: `Reserving ${resource.name}... Stake: ${stake} ETH`,
        type: 'info',
        duration: 3000,
      });

      // Call reserve function (1 day default duration)
      await reserve(resourceId, DEFAULT_RESERVATION_DURATION);
      
    } catch (err) {
      console.error('Reservation error:', err);
    }
  };

  /**
   * Handle resource release
   * Returns stake to user
   */
  const handleRelease = async () => {
    if (!isConnected || !userAddress) {
      toaster.create({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    if (!isUserReserver) {
      toaster.create({
        title: 'Not Authorized',
        description: 'Only the reserver can release this resource.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    try {
      toaster.create({
        title: 'Releasing Resource',
        description: `Releasing ${resource?.name}... Your stake will be returned.`,
        type: 'info',
        duration: 3000,
      });

      await release(resourceId);
      
    } catch (err) {
      console.error('Release error:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={5}
        border="1px"
        borderColor="gray.200"
        h="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={3}>
          <Spinner size="lg" color="brand.500" />
          <Text color="gray.500">Loading resource...</Text>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={5}
        border="1px"
        borderColor="red.200"
        h="full"
      >
        <VStack gap={2}>
          <Text color="red.500" fontWeight="bold">Error Loading Resource</Text>
          <Text color="gray.600" fontSize="sm">{error?.message || 'Resource not found'}</Text>
        </VStack>
      </Box>
    );
  }

  // Calculate progress percentage for timer
  const totalDuration = Number(resource.reservationEnd - resource.reservationStart);
  const progressPercentage = totalDuration > 0 
    ? ((totalDuration - timeRemaining) / totalDuration) * 100 
    : 0;

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
      borderColor={resource.isReserved ? 'orange.200' : 'gray.200'}
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
            colorScheme={getCategoryColor(resource.category)}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {resource.categoryName}
          </Badge>
          <Badge
            colorScheme={resource.isReserved ? 'orange' : 'green'}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {resource.isReserved ? 'RESERVED' : 'AVAILABLE'}
          </Badge>
          {isUserReserver && (
            <Badge
              colorScheme="blue"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              YOUR RESERVATION
            </Badge>
          )}
        </HStack>

        {/* Reservation Info */}
        {resource.isReserved && (
          <VStack align="stretch" gap={2} bg="orange.50" p={3} borderRadius="md">
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">Time Remaining:</Text>
              <Text fontSize="sm" fontWeight="bold" color="orange.600">
                {formatRemainingTime(timeRemaining)}
              </Text>
            </Flex>
            <ProgressBar value={progressPercentage} size="sm" colorScheme="orange" />
            {resource.currentReserver && !isUserReserver && (
              <Text fontSize="xs" color="gray.500">
                Reserved by: {resource.currentReserver.slice(0, 6)}...{resource.currentReserver.slice(-4)}
              </Text>
            )}
          </VStack>
        )}

        {/* Stake Info for Available Resources */}
        {!resource.isReserved && (
          <Box bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="xs" color="gray.600">
              Required Stake: <strong>{stake} ETH</strong>
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Refunded upon release
            </Text>
          </Box>
        )}

        {/* Gasless Badge */}
        {useGasless && (
          <Badge colorScheme="purple" fontSize="xs" alignSelf="flex-start">
            ⚡ Gasless Available
          </Badge>
        )}
      </VStack>

      {/* Action Buttons */}
      <VStack gap={2} mt={4}>
        {!resource.isReserved ? (
          <Button
            colorScheme="brand"
            size="md"
            w="full"
            onClick={handleReserve}
            loading={isReserving}
            loadingText="Reserving..."
            disabled={!isConnected || isReserving}
          >
            Reserve (1 day)
          </Button>
        ) : isUserReserver ? (
          <Button
            colorScheme="orange"
            size="md"
            w="full"
            onClick={handleRelease}
            loading={isReleasing}
            loadingText="Releasing..."
            disabled={isReleasing}
          >
          >
            Release & Get Stake Back
          </Button>
        ) : (
          <Button
            size="md"
            w="full"
            disabled
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            Reserved by Another User
          </Button>
        )}
      </VStack>
    </Box>
  );
}
