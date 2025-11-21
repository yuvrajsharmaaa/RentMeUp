/**
 * Sidebar Component
 * 
 * Navigation sidebar for the application featuring:
 * - List of main navigation items (Resources, Proposals, AI Suggestions)
 * - Active route highlighting
 * - Responsive behavior (collapsible on mobile)
 * - Icon support for visual navigation
 * 
 * Navigation items are defined in the NAV_ITEMS constant.
 * Each item includes a label, href (route), and optional icon.
 * 
 * Responsive behavior:
 * - Mobile: Hidden by default, toggleable via hamburger menu (can be extended)
 * - Tablet/Desktop: Always visible on the left side
 * 
 * @component
 */

'use client';

import { Box, VStack, Link, Text, Icon, Flex } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { NavItem } from '@/types';

/**
 * Navigation items configuration
 * Add or modify routes here to update sidebar navigation
 */
const NAV_ITEMS: NavItem[] = [
  {
    label: 'Resources',
    href: '/',
    icon: '📚',
  },
  {
    label: 'Proposals',
    href: '/proposals',
    icon: '📝',
  },
  {
    label: 'AI Suggestions',
    href: '/ai-suggestions',
    icon: '🤖',
  },
];

/**
 * Sidebar Component
 * 
 * Renders navigation menu with active state highlighting
 * Uses Next.js Link for client-side navigation
 */
export default function Sidebar() {
  const pathname = usePathname();

  /**
   * Check if a navigation item is currently active
   * Exact match for home route, startsWith for others
   */
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <Box
      as="nav"
      w={{ base: 'full', md: '250px' }}
      bg="white"
      borderRight={{ base: 'none', md: '1px' }}
      borderBottom={{ base: '1px', md: 'none' }}
      borderColor="gray.200"
      p={4}
      position={{ base: 'relative', md: 'sticky' }}
      top={{ base: 'auto', md: '73px' }}
      h={{ base: 'auto', md: 'calc(100vh - 73px)' }}
      overflowY="auto"
    >
      {/* Navigation Title */}
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={4}
      >
        Navigation
      </Text>

      {/* Navigation Items */}
      <VStack gap={2} align="stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              as={NextLink}
              href={item.href}
              _hover={{ textDecoration: 'none' }}
            >
              <Flex
                align="center"
                px={4}
                py={3}
                borderRadius="md"
                bg={active ? 'brand.50' : 'transparent'}
                color={active ? 'brand.600' : 'gray.700'}
                fontWeight={active ? 'semibold' : 'medium'}
                transition="all 0.2s"
                _hover={{
                  bg: active ? 'brand.100' : 'gray.50',
                  transform: 'translateX(4px)',
                }}
                cursor="pointer"
              >
                {/* Icon */}
                {item.icon && (
                  <Text fontSize="xl" mr={3}>
                    {item.icon}
                  </Text>
                )}

                {/* Label */}
                <Text fontSize="md">{item.label}</Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>

      {/* Footer/Info Section */}
      <Box mt={8} pt={8} borderTop="1px" borderColor="gray.200">
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Web3 Campus Dashboard
          <br />
          Version 1.0.0
        </Text>
      </Box>
    </Box>
  );
}
