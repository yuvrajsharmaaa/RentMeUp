/**
 * Custom React hooks for interacting with CampusResourceNFT contract
 * 
 * These hooks provide type-safe access to contract read/write functions
 * using Wagmi v3 hooks. All hooks include proper error handling and loading states.
 */

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { 
  CAMPUS_RESOURCE_NFT_ABI, 
  CONTRACT_ADDRESSES, 
  Resource, 
  ResourceWithId,
  UserReservation,
  getCategoryName,
  formatRemainingTime
} from '@/config/contract';

// ==================== Helper Functions ====================

/**
 * Get contract address for current chain
 */
export const useContractAddress = (): Address | undefined => {
  const chainId = useChainId();
  return CONTRACT_ADDRESSES[chainId];
};

// ==================== Read Hooks ====================

/**
 * Hook to get reservation stake amount
 * @returns The required stake amount in ETH
 */
export const useReservationStake = () => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'RESERVATION_STAKE',
  });

  return {
    stake: data ? formatEther(data as bigint) : '0',
    stakeWei: data as bigint | undefined,
    isLoading,
    error
  };
};

/**
 * Hook to get maximum reservation duration
 * @returns The max duration in seconds
 */
export const useMaxReservationDuration = () => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'MAX_RESERVATION_DURATION',
  });

  return {
    maxDuration: data ? Number(data) : 0,
    isLoading,
    error
  };
};

/**
 * Hook to get resource details
 * @param resourceId - The ID of the resource
 * @returns Resource data with computed fields
 */
export const useResource = (resourceId: number) => {
  const contractAddress = useContractAddress();
  const [resource, setResource] = useState<ResourceWithId | null>(null);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'getResource',
    args: [BigInt(resourceId)],
  });

  // Compute derived fields
  useEffect(() => {
    if (data) {
      const resourceData = data as Resource;
      const now = Math.floor(Date.now() / 1000);
      const remainingTime = resourceData.isReserved 
        ? Number(resourceData.reservationEnd) - now 
        : 0;

      setResource({
        ...resourceData,
        id: resourceId,
        remainingTime: Math.max(0, remainingTime),
        isExpired: remainingTime <= 0,
        categoryName: getCategoryName(resourceData.category)
      });
    }
  }, [data, resourceId]);

  return {
    resource,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook to check if resource is reserved
 * @param resourceId - The ID of the resource
 * @returns Boolean indicating reservation status
 */
export const useIsResourceReserved = (resourceId: number) => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'isResourceReserved',
    args: [BigInt(resourceId)],
  });

  return {
    isReserved: data as boolean | undefined,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook to get current reserver of a resource
 * @param resourceId - The ID of the resource
 * @returns Address of current reserver
 */
export const useCurrentReserver = (resourceId: number) => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'getCurrentReserver',
    args: [BigInt(resourceId)],
  });

  return {
    reserver: data as Address | undefined,
    isLoading,
    error
  };
};

/**
 * Hook to get remaining reservation time
 * @param resourceId - The ID of the resource
 * @returns Remaining time in seconds
 */
export const useRemainingTime = (resourceId: number) => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'getRemainingReservationTime',
    args: [BigInt(resourceId)],
  });

  return {
    remainingTime: data ? Number(data) : 0,
    formattedTime: data ? formatRemainingTime(Number(data)) : 'N/A',
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook to get reservation history for a resource
 * @param resourceId - The ID of the resource
 * @returns Array of addresses who have reserved this resource
 */
export const useReservationHistory = (resourceId: number) => {
  const contractAddress = useContractAddress();
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'getReservationHistory',
    args: [BigInt(resourceId)],
  });

  return {
    history: data as Address[] | undefined,
    isLoading,
    error
  };
};

// ==================== Write Hooks ====================

/**
 * Hook to reserve a resource
 * Handles transaction submission and provides loading/error states
 */
export const useReserveResource = () => {
  const { stakeWei } = useReservationStake();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const contractAddress = useContractAddress();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Reserve a resource with specified duration
   * @param resourceId - The ID of the resource to reserve
   * @param durationInSeconds - Duration of reservation in seconds
   */
  const reserve = async (resourceId: number, durationInSeconds: number) => {
    if (!stakeWei || !contractAddress) {
      throw new Error('Contract not configured or stake amount not loaded');
    }

    return writeContract({
      address: contractAddress,
      abi: CAMPUS_RESOURCE_NFT_ABI,
      functionName: 'reserveResource',
      args: [BigInt(resourceId), BigInt(durationInSeconds)],
      value: stakeWei, // Send ETH stake
    });
  };

  return {
    reserve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
};

/**
 * Hook to release a reserved resource
 * Returns staked ETH to the user
 */
export const useReleaseResource = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const contractAddress = useContractAddress();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Release a reserved resource
   * @param resourceId - The ID of the resource to release
   */
  const release = async (resourceId: number) => {
    if (!contractAddress) {
      throw new Error('Contract not configured');
    }

    return writeContract({
      address: contractAddress,
      abi: CAMPUS_RESOURCE_NFT_ABI,
      functionName: 'releaseResource',
      args: [BigInt(resourceId)],
    });
  };

  return {
    release,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
};

// ==================== Composite Hooks ====================

/**
 * Hook to get all user's active reservations
 * This is a client-side aggregation - in production, use subgraph or indexer
 * 
 * @param userAddress - The user's wallet address
 * @param totalResources - Total number of resources to check (default: 100)
 * @returns Array of user's active reservations
 */
export const useUserReservations = (userAddress: Address | undefined, totalResources: number = 100) => {
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const contractAddress = useContractAddress();

  useEffect(() => {
    if (!userAddress || !contractAddress) {
      setIsLoading(false);
      return;
    }

    // Note: This is inefficient for large numbers of resources
    // In production, use event logs or a subgraph
    const fetchReservations = async () => {
      setIsLoading(true);
      const userReservations: UserReservation[] = [];

      // This would need to be implemented with event logs in production
      // For now, we'll return empty array and rely on event listeners
      
      setReservations(userReservations);
      setIsLoading(false);
    };

    fetchReservations();
  }, [userAddress, contractAddress]);

  return {
    reservations,
    isLoading
  };
};

/**
 * Hook to get comprehensive resource data with user context
 * Combines multiple read calls for complete resource information
 * 
 * @param resourceId - The ID of the resource
 * @returns Complete resource data with user reservation status
 */
export const useResourceDetails = (resourceId: number) => {
  const { address: userAddress } = useAccount();
  const { resource, isLoading: resourceLoading, error: resourceError, refetch } = useResource(resourceId);
  const { history, isLoading: historyLoading } = useReservationHistory(resourceId);

  // Check if current user is the reserver
  const isUserReserver = userAddress && resource?.currentReserver 
    ? resource.currentReserver.toLowerCase() === userAddress.toLowerCase()
    : false;

  return {
    resource,
    history,
    isUserReserver,
    isLoading: resourceLoading || historyLoading,
    error: resourceError,
    refetch
  };
};
