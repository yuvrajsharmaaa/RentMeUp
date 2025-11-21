/**
 * Dashboard Home Page (Server Component)
 * 
 * Main landing page displaying available campus resources in a responsive grid.
 * 
 * Features:
 * - Grid layout of resource cards (1-3 columns based on screen size)
 * - Displays all resources from placeholder data
 * - Responsive design for mobile, tablet, and desktop
 * - Statistics summary at the top
 * - Filter/search capabilities (can be extended)
 * 
 * Responsive grid:
 * - Mobile (base): 1 column
 * - Tablet (md): 2 columns
 * - Desktop (lg): 3 columns
 * 
 * @page
 */

'use client';

import { Box, Heading, Text, SimpleGrid, Flex, Badge } from '@chakra-ui/react';
import ResourceCard from '@/components/ResourceCard';
import { SAMPLE_RESOURCES } from '@/utils/data';
import { useMemo } from 'react';

/**
 * Dashboard Home Page Component
 * 
 * Renders the main dashboard with resource statistics and grid
 */
export default function DashboardPage() {
  /**
   * Calculate statistics from resources
   * Memoized to avoid recalculation on every render
   */
  const stats = useMemo(() => {
    const total = SAMPLE_RESOURCES.length;
    const available = SAMPLE_RESOURCES.filter(r => r.status === 'available').length;
    const reserved = SAMPLE_RESOURCES.filter(r => r.status === 'reserved').length;
    
    return { total, available, reserved };
  }, []);

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
          Browse and reserve campus facilities, equipment, and spaces
        </Text>
      </Box>

      {/* Statistics Summary */}
      <Flex
        gap={4}
        mb={8}
        direction={{ base: 'column', sm: 'row' }}
        wrap="wrap"
      >
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          flex="1"
          minW="200px"
        >
          <Text fontSize="sm" color="gray.600" mb={1}>
            Total Resources
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="brand.600">
            {stats.total}
          </Text>
        </Box>
        
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          flex="1"
          minW="200px"
        >
          <Text fontSize="sm" color="gray.600" mb={1}>
            Available
          </Text>
          <Flex align="center" gap={2}>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">
              {stats.available}
            </Text>
            <Badge colorScheme="green" fontSize="md">
              {Math.round((stats.available / stats.total) * 100)}%
            </Badge>
          </Flex>
        </Box>
        
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          flex="1"
          minW="200px"
        >
          <Text fontSize="sm" color="gray.600" mb={1}>
            Reserved
          </Text>
          <Flex align="center" gap={2}>
            <Text fontSize="3xl" fontWeight="bold" color="red.600">
              {stats.reserved}
            </Text>
            <Badge colorScheme="red" fontSize="md">
              {Math.round((stats.reserved / stats.total) * 100)}%
            </Badge>
          </Flex>
        </Box>
      </Flex>

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
          {SAMPLE_RESOURCES.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </SimpleGrid>
      </Box>

      {/* Empty State - Only shown when no resources */}
      {SAMPLE_RESOURCES.length === 0 && (
        <Box
          textAlign="center"
          py={12}
          px={6}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
        >
          <Text fontSize="xl" color="gray.600" mb={2}>
            No resources available
          </Text>
          <Text fontSize="md" color="gray.500">
            Check back later for new resources
          </Text>
        </Box>
      )}
    </Box>
  );
}
