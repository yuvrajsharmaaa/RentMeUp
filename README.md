# Web3 Campus Resources Dashboard

A modern, decentralized dashboard for managing and reserving campus resources built with Next.js 14, TypeScript, Chakra UI, and Wagmi for Web3 integration.

![Dashboard Preview](https://via.placeholder.com/800x400/0073e6/ffffff?text=Web3+Campus+Dashboard)

## 🚀 Features

- **🎨 Modern UI**: Fully responsive design using Chakra UI components
- **🔐 Web3 Integration**: Connect wallet using Wagmi (MetaMask, WalletConnect)
- **📊 Resource Management**: Browse and reserve campus resources
- **🌐 Network Support**: Ethereum Mainnet and Sepolia testnet
- **📱 Mobile First**: Optimized for all screen sizes
- **⚡ Fast Performance**: Built with Next.js 14 App Router
- **🎯 Type Safe**: Full TypeScript implementation

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Component Interfaces](#component-interfaces)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠 Tech Stack

### Core Framework
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### Styling & UI
- **Chakra UI** - Component library with responsive design
- **Emotion** - CSS-in-JS styling
- **Framer Motion** - Animation library

### Web3 Integration
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **TanStack Query** - Data fetching and caching

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Web3 wallet (MetaMask recommended)
- (Optional) WalletConnect Project ID for WalletConnect support

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /path/to/MSI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   Get your WalletConnect Project ID from: https://cloud.walletconnect.com

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/home/yuvrajs/Desktop/MSI/
├── .github/
│   └── copilot-instructions.md   # GitHub Copilot workspace instructions
├── app/                          # Next.js 14 App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard home page
│   ├── proposals/
│   │   └── page.tsx            # Proposals page (placeholder)
│   └── ai-suggestions/
│       └── page.tsx            # AI suggestions page (placeholder)
├── components/                   # Reusable React components
│   ├── Header.tsx              # Top navigation with wallet connection
│   ├── Sidebar.tsx             # Side navigation menu
│   ├── ResourceCard.tsx        # Individual resource card
│   └── Providers.tsx           # Context providers wrapper
├── config/                       # Configuration files
│   └── wagmi.ts                # Wagmi Web3 configuration
├── styles/                       # Styling configuration
│   └── theme.ts                # Chakra UI custom theme
├── types/                        # TypeScript type definitions
│   └── index.ts                # Shared interfaces and types
├── utils/                        # Utility functions and helpers
│   └── data.ts                 # Placeholder/sample data
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Key Directories Explained

#### `/app` - Next.js App Router
Contains all pages and layouts using Next.js 14's App Router pattern. Each folder represents a route.

#### `/components` - React Components
Reusable UI components used throughout the application:
- **Header**: Wallet connection, network info, app branding
- **Sidebar**: Navigation menu with active state
- **ResourceCard**: Displays individual resource with reserve button
- **Providers**: Wraps app with Web3, Query, and Chakra providers

#### `/config` - Configuration
- **wagmi.ts**: Web3 configuration (chains, connectors, transports)

#### `/styles` - Styling
- **theme.ts**: Chakra UI theme customization (colors, components, global styles)

#### `/types` - TypeScript Types
- **index.ts**: Shared interfaces (Resource, NavItem, etc.)

#### `/utils` - Utilities
- **data.ts**: Placeholder data for development and testing

## ⚙️ Configuration

### Wagmi Configuration

Edit `config/wagmi.ts` to customize Web3 settings:

```typescript
// Add or remove blockchain networks
import { mainnet, sepolia, polygon } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia, polygon], // Add more chains
  // ... other config
});
```

### Chakra UI Theme

Customize the theme in `styles/theme.ts`:

```typescript
// Modify brand colors
const colors = {
  brand: {
    500: '#0073e6', // Primary color
    // ... other shades
  },
};
```

## 📜 Available Scripts

```bash
# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## 🔌 Component Interfaces

### Resource Interface

```typescript
interface Resource {
  id: string;              // Unique identifier
  name: string;            // Display name
  category: ResourceCategory; // Lab, Equipment, Room, Vehicle, Other
  status: ResourceStatus;  // available or reserved
  description?: string;    // Optional description
  location?: string;       // Optional physical location
}
```

### NavItem Interface

```typescript
interface NavItem {
  label: string;   // Display text
  href: string;    // Route path
  icon?: string;   // Optional icon (emoji or component name)
}
```

### Component Props

#### ResourceCard
```typescript
interface ResourceCardProps {
  resource: Resource;  // Resource object to display
}
```

#### Providers
```typescript
interface ProvidersProps {
  children: React.ReactNode;  // Child components to wrap
}
```

## 🔐 Environment Variables

Create a `.env.local` file for local development:

```env
# WalletConnect Project ID (optional but recommended)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Custom RPC URLs (optional)
# NEXT_PUBLIC_MAINNET_RPC_URL=https://...
# NEXT_PUBLIC_SEPOLIA_RPC_URL=https://...
```

**Note**: All public environment variables must be prefixed with `NEXT_PUBLIC_`.

## 🌐 Supported Networks

- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)

Add more networks in `config/wagmi.ts`.

## 🔧 Customization Guide

### Adding New Resources

Edit `utils/data.ts`:

```typescript
export const SAMPLE_RESOURCES: Resource[] = [
  // Add your resources here
  {
    id: '9',
    name: 'New Resource',
    category: 'Lab',
    status: 'available',
    description: 'Description here',
    location: 'Building X'
  },
];
```

### Adding Navigation Items

Edit `components/Sidebar.tsx`:

```typescript
const NAV_ITEMS: NavItem[] = [
  { label: 'Resources', href: '/', icon: '📚' },
  { label: 'New Page', href: '/new-page', icon: '🆕' },
  // Add more items
];
```

### Creating New Pages

1. Create a new folder in `/app`
2. Add a `page.tsx` file
3. Export a default React component

Example:
```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My New Page</div>;
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production bundle:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## 📝 Development Notes

### Web3 Integration

The app uses Wagmi v2 for Web3 functionality:
- `useAccount()` - Get connected wallet address and chain info
- `useConnect()` - Trigger wallet connection
- `useDisconnect()` - Disconnect wallet
- `useBalance()` - Get wallet balance (not currently used)

### State Management

- **React Context**: Provided by Wagmi and Chakra
- **TanStack Query**: For data fetching and caching
- **React Hooks**: For local component state

### Responsive Design

Chakra UI breakpoints:
- `base`: 0px (mobile)
- `sm`: 480px
- `md`: 768px (tablet)
- `lg`: 992px (desktop)
- `xl`: 1280px
- `2xl`: 1536px

Use responsive props:
```typescript
<Box fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} />
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Chakra UI** - Beautiful component library
- **Wagmi** - Excellent Web3 React hooks
- **Viem** - Modern Ethereum library

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Built with ❤️ using Next.js, TypeScript, Chakra UI, and Wagmi**
