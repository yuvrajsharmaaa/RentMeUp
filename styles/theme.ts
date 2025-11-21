/**
 * Chakra UI Theme Configuration
 * 
 * This file defines the custom theme for the application including:
 * - Color schemes and palettes
 * - Component style overrides
 * - Responsive breakpoints
 * - Global styles
 * 
 * Chakra UI uses a mobile-first responsive approach with breakpoints:
 * - base: 0px (mobile)
 * - sm: 480px
 * - md: 768px (tablet)
 * - lg: 992px (desktop)
 * - xl: 1280px
 * - 2xl: 1536px
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Custom theme configuration
 * Defines brand colors and semantic color tokens
 */
const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f2ff' },
          100: { value: '#b3d9ff' },
          200: { value: '#80bfff' },
          300: { value: '#4da6ff' },
          400: { value: '#1a8cff' },
          500: { value: '#0073e6' },
          600: { value: '#005bb3' },
          700: { value: '#004280' },
          800: { value: '#002a4d' },
          900: { value: '#00111a' },
        },
      },
    },
  },
});

/**
 * Create and export the theme system
 * Merges custom config with default Chakra config
 */
export const theme = createSystem(defaultConfig, customConfig);
