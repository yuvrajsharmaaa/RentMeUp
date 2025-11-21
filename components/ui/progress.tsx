/**
 * Progress Component Wrapper for Chakra UI v3
 * 
 * Provides a simple progress bar component compatible with Chakra UI v3
 */

import * as React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export interface ProgressProps extends BoxProps {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
}

export const ProgressBar: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  colorScheme = 'blue',
  ...props
}) => {
  const sizeMap = {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
  };

  const colorMap: Record<string, string> = {
    blue: 'blue.500',
    green: 'green.500',
    red: 'red.500',
    orange: 'orange.500',
    purple: 'purple.500',
    brand: 'brand.500',
  };

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="full"
      bg="gray.200"
      h={sizeMap[size]}
      {...props}
    >
      <Box
        bg={colorMap[colorScheme] || colorMap.blue}
        h="100%"
        w={`${Math.min(100, Math.max(0, value))}%`}
        transition="width 0.3s ease"
        borderRadius="full"
      />
    </Box>
  );
};
