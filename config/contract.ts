/**
 * Smart Contract Configuration
 * 
 * This file contains the contract ABI, addresses for different networks,
 * and TypeScript types for type-safe contract interactions.
 */

import { Address } from 'viem';

// ==================== Contract ABI ====================
export const CAMPUS_RESOURCE_NFT_ABI = [
  // Constructor
  {
    inputs: [
      { internalType: 'address', name: 'trustedForwarder', type: 'address' },
      { internalType: 'uint256', name: 'reservationStake', type: 'uint256' },
      { internalType: 'string', name: 'uri', type: 'string' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'resourceId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'uint8', name: 'category', type: 'uint8' }
    ],
    name: 'ResourceCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'resourceId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'reserver', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stakeAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'reservationEnd', type: 'uint256' }
    ],
    name: 'ResourceReserved',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'resourceId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'reserver', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stakeReturned', type: 'uint256' }
    ],
    name: 'ResourceReleased',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'resourceId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'previousReserver', type: 'address' }
    ],
    name: 'ReservationExpired',
    type: 'event'
  },
  // Read Functions
  {
    inputs: [],
    name: 'RESERVATION_STAKE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MAX_RESERVATION_DURATION',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'getResource',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'uint8', name: 'category', type: 'uint8' },
          { internalType: 'bool', name: 'isReserved', type: 'bool' },
          { internalType: 'address', name: 'currentReserver', type: 'address' },
          { internalType: 'uint256', name: 'reservationStart', type: 'uint256' },
          { internalType: 'uint256', name: 'reservationEnd', type: 'uint256' },
          { internalType: 'uint256', name: 'stakedAmount', type: 'uint256' },
          { internalType: 'bool', name: 'exists', type: 'bool' }
        ],
        internalType: 'struct CampusResourceNFT.Resource',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'isResourceReserved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'getCurrentReserver',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'getRemainingReservationTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'getReservationHistory',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserTotalStaked',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write Functions
  {
    inputs: [
      { internalType: 'uint256', name: 'resourceId', type: 'uint256' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' }
    ],
    name: 'reserveResource',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    name: 'releaseResource',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'uint8', name: 'category', type: 'uint8' },
      { internalType: 'uint256', name: 'initialSupply', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' }
    ],
    name: 'createResource',
    outputs: [{ internalType: 'uint256', name: 'resourceId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// ==================== Contract Addresses ====================
/**
 * Contract addresses for different networks
 * Update these after deployment
 */
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  // Hardhat local network
  31337: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || '0x0000000000000000000000000000000000000000') as Address,
  
  // Polygon Mainnet
  137: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000') as Address,
  
  // Sepolia Testnet
  11155111: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as Address,
};

// ==================== TypeScript Types ====================
/**
 * Resource categories enum matching the smart contract
 */
export enum ResourceCategory {
  LAB = 0,
  BOOK = 1,
  INSTRUMENT = 2,
  FACILITY = 3,
  OTHER = 4
}

/**
 * Resource data structure from the smart contract
 */
export interface Resource {
  name: string;
  category: ResourceCategory;
  isReserved: boolean;
  currentReserver: Address;
  reservationStart: bigint;
  reservationEnd: bigint;
  stakedAmount: bigint;
  exists: boolean;
}

/**
 * Extended resource with computed fields for UI
 */
export interface ResourceWithId extends Resource {
  id: number;
  remainingTime?: number; // in seconds
  isExpired?: boolean;
  categoryName?: string;
}

/**
 * User reservation information
 */
export interface UserReservation {
  resourceId: number;
  resourceName: string;
  category: ResourceCategory;
  reservationStart: bigint;
  reservationEnd: bigint;
  stakedAmount: bigint;
  remainingTime: number;
  isExpired: boolean;
}

// ==================== Constants ====================
/**
 * Get category name from enum value
 */
export const getCategoryName = (category: ResourceCategory): string => {
  const categoryNames: Record<ResourceCategory, string> = {
    [ResourceCategory.LAB]: 'Lab',
    [ResourceCategory.BOOK]: 'Book',
    [ResourceCategory.INSTRUMENT]: 'Instrument',
    [ResourceCategory.FACILITY]: 'Facility',
    [ResourceCategory.OTHER]: 'Other'
  };
  return categoryNames[category] || 'Unknown';
};

/**
 * Get category color for UI
 */
export const getCategoryColor = (category: ResourceCategory): string => {
  const categoryColors: Record<ResourceCategory, string> = {
    [ResourceCategory.LAB]: 'blue',
    [ResourceCategory.BOOK]: 'green',
    [ResourceCategory.INSTRUMENT]: 'purple',
    [ResourceCategory.FACILITY]: 'orange',
    [ResourceCategory.OTHER]: 'gray'
  };
  return categoryColors[category] || 'gray';
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return 'Expired';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Default reservation duration (1 day in seconds)
 */
export const DEFAULT_RESERVATION_DURATION = 86400; // 1 day

/**
 * Maximum reservation duration (7 days in seconds)
 */
export const MAX_RESERVATION_DURATION = 604800; // 7 days
