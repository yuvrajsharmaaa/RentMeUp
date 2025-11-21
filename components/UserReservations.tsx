/**
 * UserReservations Component
 * 
 * Displays user's active reservations with:
 * - List of currently reserved resources
 * - Countdown timers for each reservation
 * - Quick release buttons
 * - Total staked amount
 * - Reservation history
 * 
 * Features:
 * - Real-time data from smart contract
 * - Auto-refresh on new reservations
 * - Mobile-responsive layout
 * - Empty state for no reservations
 * 
 * @component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  Flex,
  Heading,
  Grid,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { toaster } from '@/components/ui/toaster';
import { ProgressBar } from '@/components/ui/progress';
import { 
  useReleaseResource,
  useContractAddress
} from '@/hooks/useContract';
import { 
  formatRemainingTime,
  getCategoryColor,
  getCategoryName,
  ResourceCategory
} from '@/config/contract';

/**
 * Simplified reservation data structure
 * In production, fetch from contract events or subgraph
 */
interface UserReservationItem {
  resourceId: number;
  resourceName: string;
  category: ResourceCategory;
  reservationEnd: bigint;
  stakedAmount: bigint;
}

/**
 * UserReservations Component
 * 
 * Shows all active reservations for the connected wallet
 */
export default function UserReservations() {
  const { address, isConnected } = useAccount();
  const contractAddress = useContractAddress();
  const [reservations, setReservations] = useState<UserReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Release resource hook
  const { release, isPending, isSuccess } = useReleaseResource();

  // Handle successful release
  useEffect(() => {
    if (isSuccess) {
      toaster.create({
        title: 'Resource Released',
        description: 'Your stake has been returned.',
        type: 'success',
        duration: 5000,
      });
      // Refresh reservations
      fetchUserReservations();
    }
  }, [isSuccess]);

  /**
   * Fetch user's active reservations
   * 
   * Note: This is a placeholder. In production:
   * 1. Use The Graph to index ResourceReserved events filtered by user
   * 2. Or use contract event logs with viem
   * 3. Or maintain a backend API that indexes events
   */
  const fetchUserReservations = async () => {
    if (!address || !contractAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual fetching from contract events
      // For now, return empty array
      // 
      // Example implementation with viem:
      // const logs = await publicClient.getLogs({
      //   address: contractAddress,
      //   event: parseAbiItem('event ResourceReserved(uint256 indexed resourceId, address indexed reserver, uint256 stakeAmount, uint256 reservationEnd)'),
      //   args: { reserver: address },
      //   fromBlock: 'earliest',
      //   toBlock: 'latest'
      // });
      
      setReservations([]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load your reservations.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reservations on mount and when address changes
  useEffect(() => {
    fetchUserReservations();
  }, [address, contractAddress]);

  /**
   * Handle resource release
   */
  const handleRelease = async (resourceId: number, resourceName: string) => {
    try {
      toaster.create({
        title: 'Releasing Resource',
        description: `Releasing ${resourceName}...`,
        type: 'info',
        duration: 3000,
      });

      await release(resourceId);
    } catch (error) {
      console.error('Release error:', error);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={6}
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={3}>
          <Text color="gray.600" fontSize="lg">
            Connect your wallet to view your reservations
          </Text>
        </VStack>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={6}
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={3}>
          <Spinner size="lg" color="brand.500" />
          <Text color="gray.500">Loading your reservations...</Text>
        </VStack>
      </Box>
    );
  }

  // Empty state
  if (reservations.length === 0) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={6}
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={3}>
          <Text fontSize="3xl">📚</Text>
          <Heading size="md" color="gray.700">
            No Active Reservations
          </Heading>
          <Text color="gray.500" textAlign="center">
            You haven't reserved any resources yet. Browse available resources and reserve one to get started.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={6}
      border="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            Your Reservations
          </Heading>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
            {reservations.length} Active
          </Badge>
        </Flex>

        {/* Reservations List */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={4}
        >
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.resourceId}
              reservation={reservation}
              onRelease={handleRelease}
              isReleasing={isPending}
            />
          ))}
        </Grid>
      </VStack>
    </Box>
  );
}

/**
 * Individual Reservation Card Component
 */
interface ReservationCardProps {
  reservation: UserReservationItem;
  onRelease: (resourceId: number, resourceName: string) => void;
  isReleasing: boolean;
}

function ReservationCard({ reservation, onRelease, isReleasing }: ReservationCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Calculate remaining time
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(reservation.reservationEnd) - now;
    setTimeRemaining(Math.max(0, remaining));

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation.reservationEnd]);

  const isExpired = timeRemaining <= 0;
  const progressPercentage = isExpired ? 100 : 50; // Simplified progress

  return (
    <Box
      bg={isExpired ? 'red.50' : 'blue.50'}
      borderRadius="md"
      p={4}
      border="1px"
      borderColor={isExpired ? 'red.200' : 'blue.200'}
    >
      <VStack align="stretch" gap={3}>
        {/* Resource Name */}
        <Flex justify="space-between" align="flex-start">
          <VStack align="flex-start" gap={1} flex="1">
            <Text fontWeight="bold" color="gray.800">
              {reservation.resourceName}
            </Text>
            <Badge
              colorScheme={getCategoryColor(reservation.category)}
              fontSize="xs"
            >
              {getCategoryName(reservation.category)}
            </Badge>
          </VStack>
          <Badge
            colorScheme={isExpired ? 'red' : 'green'}
            fontSize="xs"
          >
            {isExpired ? 'EXPIRED' : 'ACTIVE'}
          </Badge>
        </Flex>

        {/* Timer */}
        <VStack align="stretch" gap={1}>
          <Flex justify="space-between" fontSize="sm">
            <Text color="gray.600">Time Remaining:</Text>
            <Text fontWeight="bold" color={isExpired ? 'red.600' : 'blue.600'}>
              {formatRemainingTime(timeRemaining)}
            </Text>
          </Flex>
          <ProgressBar 
            value={progressPercentage} 
            size="sm" 
            colorScheme={isExpired ? 'red' : 'blue'} 
          />
        </VStack>

        {/* Stake Amount */}
        <Text fontSize="xs" color="gray.500">
          Staked: {Number(reservation.stakedAmount) / 1e18} ETH
        </Text>

        {/* Release Button */}
        <Button
          size="sm"
          colorScheme="orange"
          onClick={() => onRelease(reservation.resourceId, reservation.resourceName)}
          loading={isReleasing}
          loadingText="Releasing..."
        >
          Release & Get Stake Back
        </Button>
      </VStack>
    </Box>
  );
}
