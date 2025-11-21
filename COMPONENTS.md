# Component Documentation

This file provides detailed information about all React components in the application.

## 📋 Table of Contents

- [Layout Components](#layout-components)
  - [Providers](#providers)
  - [Header](#header)
  - [Sidebar](#sidebar)
- [Feature Components](#feature-components)
  - [ResourceCard](#resourcecard)
- [Page Components](#page-components)
  - [Dashboard (Home)](#dashboard-home)
  - [Proposals](#proposals)
  - [AI Suggestions](#ai-suggestions)

---

## Layout Components

### Providers

**File**: `components/Providers.tsx`

**Purpose**: Wraps the entire application with necessary context providers.

**Props**:
```typescript
{
  children: React.ReactNode  // Child components to wrap
}
```

**Providers Included**:
1. **WagmiProvider** - Web3 wallet connectivity
2. **QueryClientProvider** - Data fetching and caching
3. **ChakraProvider** - UI components and theming

**Usage**:
```tsx
<Providers>
  <App />
</Providers>
```

**Notes**:
- Must be a client component ('use client')
- Order of providers matters
- Configured with custom Wagmi config and Chakra theme

---

### Header

**File**: `components/Header.tsx`

**Purpose**: Top navigation bar with wallet connection controls.

**Props**: None (uses hooks internally)

**Hooks Used**:
- `useAccount()` - Get wallet address and connection status
- `useConnect()` - Trigger wallet connection
- `useDisconnect()` - Disconnect wallet
- `useConnectors()` - Get available wallet connectors

**Features**:
- App branding/title
- Wallet connect/disconnect button
- Network badge (shows current chain)
- Wallet address display (truncated)
- Responsive layout

**State**:
```typescript
{
  address: string | undefined       // Connected wallet address
  isConnected: boolean             // Connection status
  chain: Chain | undefined         // Current blockchain network
}
```

**Methods**:
- `handleConnect()` - Initiates wallet connection
- `handleDisconnect()` - Disconnects wallet
- `formatAddress(addr: string)` - Formats address for display

**Responsive Behavior**:
- **Mobile**: Stacked layout, smaller text
- **Desktop**: Horizontal layout, full information

---

### Sidebar

**File**: `components/Sidebar.tsx`

**Purpose**: Side navigation menu for the application.

**Props**: None

**Hooks Used**:
- `usePathname()` - Get current route

**Navigation Items**:
```typescript
interface NavItem {
  label: string    // Display text
  href: string     // Route path
  icon?: string    // Optional icon (emoji)
}
```

**Current Items**:
- Resources (/)
- Proposals (/proposals)
- AI Suggestions (/ai-suggestions)

**Features**:
- Active route highlighting
- Hover effects
- Version display
- Responsive layout

**Methods**:
- `isActive(href: string)` - Checks if route is active

**Customization**:
Modify the `NAV_ITEMS` constant to add/remove menu items:

```typescript
const NAV_ITEMS: NavItem[] = [
  { label: 'New Page', href: '/new-page', icon: '🆕' },
  // Add more items
];
```

---

## Feature Components

### ResourceCard

**File**: `components/ResourceCard.tsx`

**Purpose**: Displays a single campus resource with reservation capability.

**Props**:
```typescript
interface ResourceCardProps {
  resource: Resource  // Resource object to display
}

interface Resource {
  id: string
  name: string
  category: ResourceCategory
  status: ResourceStatus
  description?: string
  location?: string
}
```

**Hooks Used**:
- `useAccount()` - Check wallet connection for reservations

**Features**:
- Resource name and details
- Status badge (available/reserved)
- Category badge
- Location display
- Reserve button
- Wallet connection check

**Methods**:
- `handleReserve()` - Initiates resource reservation
- `getStatusColor(status: string)` - Returns color scheme for status

**States**:
- **Available**: Green badge, enabled reserve button
- **Reserved**: Red badge, disabled reserve button
- **Not Connected**: Shows warning when trying to reserve

**Styling**:
- Card with shadow and hover effect
- Responsive text sizes
- Disabled state for reserved items

**Future Enhancements**:
Replace `handleReserve()` with actual smart contract call:

```typescript
const handleReserve = async () => {
  // Example contract call
  await writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'reserveResource',
    args: [resource.id],
  });
};
```

---

## Page Components

### Dashboard (Home)

**File**: `app/page.tsx`

**Purpose**: Main landing page showing all resources and statistics.

**Features**:
- Page title and description
- Statistics cards (total, available, reserved)
- Resource grid (responsive columns)
- Empty state placeholder

**Layout**:
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

**Data Source**:
```typescript
import { SAMPLE_RESOURCES } from '@/utils/data';
```

**Statistics Calculation**:
```typescript
const stats = {
  total: SAMPLE_RESOURCES.length,
  available: SAMPLE_RESOURCES.filter(r => r.status === 'available').length,
  reserved: SAMPLE_RESOURCES.filter(r => r.status === 'reserved').length,
};
```

**Future Enhancements**:
- Search/filter functionality
- Sorting options
- Pagination for large datasets
- Real-time updates

---

### Proposals

**File**: `app/proposals/page.tsx`

**Purpose**: Placeholder page for community governance proposals.

**Status**: Coming Soon

**Planned Features**:
- List active proposals
- Voting mechanism
- Create new proposal form
- Filter by status
- Integration with DAO smart contract

---

### AI Suggestions

**File**: `app/ai-suggestions/page.tsx`

**Purpose**: Placeholder page for AI-powered resource recommendations.

**Status**: Coming Soon

**Planned Features**:
- Personalized resource suggestions
- Usage pattern analysis
- Peak time predictions
- Resource optimization tips
- ML model integration

---

## 🎨 Styling Patterns

### Responsive Props

All components use Chakra UI's responsive prop syntax:

```typescript
<Box
  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
  p={{ base: 4, md: 6 }}
/>
```

### Color Schemes

**Brand Colors**: Defined in `styles/theme.ts`
- Primary: `brand.500` (#0073e6)
- Hover: `brand.600`
- Light: `brand.50`

**Status Colors**:
- Available: `green`
- Reserved: `red`
- Warning: `orange`
- Info: `blue`

### Common Patterns

**Card with Hover**:
```typescript
<Box
  bg="white"
  borderRadius="lg"
  boxShadow="md"
  _hover={{
    boxShadow: 'xl',
    transform: 'translateY(-4px)',
  }}
  transition="all 0.3s"
/>
```

**Responsive Grid**:
```typescript
<SimpleGrid
  columns={{ base: 1, md: 2, lg: 3 }}
  gap={{ base: 4, md: 6 }}
/>
```

---

## 🔧 Component Best Practices

### 1. **Always Document**
```typescript
/**
 * Component description
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
```

### 2. **Type Everything**
```typescript
interface MyComponentProps {
  title: string
  onAction: () => void
}
```

### 3. **Use Semantic HTML**
```typescript
<Box as="section" ...>  // Use semantic elements
<Heading as="h1" ...>   // Proper heading hierarchy
```

### 4. **Handle Loading States**
```typescript
{isLoading ? <Spinner /> : <Content />}
```

### 5. **Error Handling**
```typescript
try {
  // Action
} catch (error) {
  // Show error toast
}
```

---

## 🚀 Creating New Components

### Template

```typescript
/**
 * [Component Name]
 * 
 * [Description of what it does]
 * 
 * @component
 */

'use client';  // If needs client features

import { Box } from '@chakra-ui/react';

/**
 * Props interface
 */
interface MyComponentProps {
  // Define props
}

/**
 * Component description
 */
export default function MyComponent({ ...props }: MyComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  
  return (
    <Box>
      {/* JSX */}
    </Box>
  );
}
```

### Steps

1. Create file in `/components`
2. Define TypeScript interface for props
3. Document with JSDoc comments
4. Implement responsive design
5. Add to relevant page/layout
6. Test on all screen sizes

---

## 📱 Responsive Testing

Test components at these breakpoints:
- **320px** - Small mobile
- **768px** - Tablet
- **1024px** - Desktop
- **1440px** - Large desktop

Use browser DevTools device emulator (F12 → Toggle Device Toolbar)

---

**Last Updated**: November 2025  
**Version**: 1.0.0
