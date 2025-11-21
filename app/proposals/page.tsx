/**
 * Proposals Page (Placeholder)
 * 
 * This page will display community proposals for resource allocation,
 * improvements, or new resources. Users can vote on proposals using
 * their connected wallet.
 * 
 * Future features:
 * - List active proposals
 * - Display proposal details (title, description, votes)
 * - Voting mechanism (connected to smart contract)
 * - Create new proposal form
 * - Filter by status (active, passed, rejected)
 */

'use client';

import { Box, Heading, Text, Center, Icon } from '@chakra-ui/react';

export default function ProposalsPage() {
  return (
    <Box maxW="1400px" mx="auto">
      <Heading
        as="h1"
        size={{ base: 'xl', md: '2xl' }}
        mb={4}
        color="gray.800"
      >
        Proposals
      </Heading>
      
      <Center
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={12}
        minH="400px"
        flexDirection="column"
        gap={4}
      >
        <Text fontSize="6xl">📝</Text>
        <Heading size="lg" color="gray.600">
          Coming Soon
        </Heading>
        <Text fontSize="md" color="gray.500" textAlign="center" maxW="500px">
          Community governance proposals will be displayed here. 
          Vote on resource allocations and improvements using your wallet.
        </Text>
      </Center>
    </Box>
  );
}
