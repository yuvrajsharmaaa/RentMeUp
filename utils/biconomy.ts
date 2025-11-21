/**
 * Biconomy Integration for Gasless Transactions (EIP-2771)
 * 
 * This module provides utilities for sending meta-transactions through Biconomy
 * to enable gasless user experiences. Users can reserve/release resources without
 * paying gas fees.
 * 
 * Note: This is a simplified implementation. For production, use Biconomy SDK v4
 * with Account Abstraction.
 */

import { Address, encodeFunctionData, Hex } from 'viem';
import { CAMPUS_RESOURCE_NFT_ABI, CONTRACT_ADDRESSES } from '@/config/contract';

// ==================== Configuration ====================

/**
 * Biconomy configuration for different networks
 * Update these with your Biconomy API keys and forwarder addresses
 */
export const BICONOMY_CONFIG: Record<number, {
  apiKey: string;
  forwarderAddress: Address;
  enabled: boolean;
}> = {
  // Polygon Mainnet
  137: {
    apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY_POLYGON || '',
    forwarderAddress: (process.env.NEXT_PUBLIC_BICONOMY_FORWARDER_POLYGON || '0x0000000000000000000000000000000000000000') as Address,
    enabled: !!process.env.NEXT_PUBLIC_BICONOMY_API_KEY_POLYGON
  },
  // Sepolia Testnet
  11155111: {
    apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY_SEPOLIA || '',
    forwarderAddress: (process.env.NEXT_PUBLIC_BICONOMY_FORWARDER_SEPOLIA || '0x0000000000000000000000000000000000000000') as Address,
    enabled: !!process.env.NEXT_PUBLIC_BICONOMY_API_KEY_SEPOLIA
  },
};

// ==================== Types ====================

interface MetaTransactionRequest {
  from: Address;
  to: Address;
  data: Hex;
  value?: bigint;
  chainId: number;
}

interface BiconomyResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

// ==================== Helper Functions ====================

/**
 * Check if Biconomy is enabled for the current chain
 */
export const isBiconomyEnabled = (chainId: number): boolean => {
  const config = BICONOMY_CONFIG[chainId];
  return config?.enabled || false;
};

/**
 * Get Biconomy configuration for a specific chain
 */
export const getBiconomyConfig = (chainId: number) => {
  return BICONOMY_CONFIG[chainId];
};

// ==================== Meta-Transaction Functions ====================

/**
 * Encode reserve resource function call
 * @param resourceId - The ID of the resource to reserve
 * @param duration - Duration in seconds
 * @returns Encoded function data
 */
export const encodeReserveResource = (resourceId: number, duration: number): Hex => {
  return encodeFunctionData({
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'reserveResource',
    args: [BigInt(resourceId), BigInt(duration)],
  });
};

/**
 * Encode release resource function call
 * @param resourceId - The ID of the resource to release
 * @returns Encoded function data
 */
export const encodeReleaseResource = (resourceId: number): Hex => {
  return encodeFunctionData({
    abi: CAMPUS_RESOURCE_NFT_ABI,
    functionName: 'releaseResource',
    args: [BigInt(resourceId)],
  });
};

/**
 * Send a meta-transaction through Biconomy
 * 
 * Note: This is a placeholder implementation. For production:
 * 1. Install @biconomy/account package
 * 2. Initialize SmartAccount with Biconomy SDK
 * 3. Use sendTransaction method from SDK
 * 
 * @param request - The meta-transaction request
 * @returns Transaction hash if successful
 */
export const sendMetaTransaction = async (
  request: MetaTransactionRequest
): Promise<BiconomyResponse> => {
  const config = BICONOMY_CONFIG[request.chainId];

  if (!config || !config.enabled) {
    return {
      success: false,
      error: 'Biconomy not configured for this network'
    };
  }

  try {
    // In production, this would use Biconomy SDK:
    // 
    // import { BiconomySmartAccountV2 } from "@biconomy/account";
    // 
    // const smartAccount = await BiconomySmartAccountV2.create({
    //   chainId: request.chainId,
    //   bundler: biconomyBundler,
    //   paymaster: biconomyPaymaster,
    //   signer: walletClient
    // });
    // 
    // const userOp = await smartAccount.buildUserOp([{
    //   to: request.to,
    //   data: request.data,
    //   value: request.value
    // }]);
    // 
    // const userOpResponse = await smartAccount.sendUserOp(userOp);
    // const { transactionHash } = await userOpResponse.waitForTxHash();
    // 
    // return { success: true, txHash: transactionHash };

    // For now, return a placeholder response
    console.warn('Biconomy SDK not implemented. Use regular transactions instead.');
    
    return {
      success: false,
      error: 'Gasless transactions not fully implemented. Please use regular transactions.'
    };
  } catch (error) {
    console.error('Meta-transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Reserve resource using gasless transaction
 * 
 * @param userAddress - User's wallet address
 * @param resourceId - Resource to reserve
 * @param duration - Duration in seconds
 * @param chainId - Current chain ID
 * @param stakeAmount - Stake amount in wei (still required even with gasless tx)
 * @returns Transaction result
 */
export const gaslessReserveResource = async (
  userAddress: Address,
  resourceId: number,
  duration: number,
  chainId: number,
  stakeAmount: bigint
): Promise<BiconomyResponse> => {
  const contractAddress = CONTRACT_ADDRESSES[chainId];
  
  if (!contractAddress) {
    return {
      success: false,
      error: 'Contract not deployed on this network'
    };
  }

  const data = encodeReserveResource(resourceId, duration);

  return sendMetaTransaction({
    from: userAddress,
    to: contractAddress,
    data,
    value: stakeAmount,
    chainId
  });
};

/**
 * Release resource using gasless transaction
 * 
 * @param userAddress - User's wallet address
 * @param resourceId - Resource to release
 * @param chainId - Current chain ID
 * @returns Transaction result
 */
export const gaslessReleaseResource = async (
  userAddress: Address,
  resourceId: number,
  chainId: number
): Promise<BiconomyResponse> => {
  const contractAddress = CONTRACT_ADDRESSES[chainId];
  
  if (!contractAddress) {
    return {
      success: false,
      error: 'Contract not deployed on this network'
    };
  }

  const data = encodeReleaseResource(resourceId);

  return sendMetaTransaction({
    from: userAddress,
    to: contractAddress,
    data,
    chainId
  });
};

// ==================== Instructions for Production ====================

/**
 * TO ENABLE GASLESS TRANSACTIONS:
 * 
 * 1. Install Biconomy SDK:
 *    npm install @biconomy/account @biconomy/bundler @biconomy/paymaster
 * 
 * 2. Get API keys from Biconomy Dashboard (https://dashboard.biconomy.io/)
 *    - Create a new DApp
 *    - Enable gasless transactions for your contract
 *    - Copy API keys for each network
 * 
 * 3. Add environment variables to .env.local:
 *    NEXT_PUBLIC_BICONOMY_API_KEY_POLYGON=your_polygon_api_key
 *    NEXT_PUBLIC_BICONOMY_API_KEY_SEPOLIA=your_sepolia_api_key
 *    NEXT_PUBLIC_BICONOMY_FORWARDER_POLYGON=0x... (from Biconomy docs)
 *    NEXT_PUBLIC_BICONOMY_FORWARDER_SEPOLIA=0x... (from Biconomy docs)
 * 
 * 4. Update sendMetaTransaction function with actual Biconomy SDK implementation
 * 
 * 5. Test gasless transactions on testnet before deploying to mainnet
 * 
 * ALTERNATIVE: Use Biconomy's SDK Manager for easier integration
 * https://docs.biconomy.io/account/integration
 */
