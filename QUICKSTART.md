# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔗 Connect Your Wallet

1. Install [MetaMask](https://metamask.io/) or another Web3 wallet browser extension
2. Click the "Connect Wallet" button in the header
3. Approve the connection in your wallet
4. Your address and network will be displayed in the header

## 📱 Testing Responsive Design

- **Mobile**: Resize browser to < 768px
- **Tablet**: 768px - 992px
- **Desktop**: > 992px

Use browser DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)

## 🎨 Main Features to Explore

### Dashboard (/)
- View all campus resources in a grid
- See availability statistics
- Reserve resources (requires wallet connection)

### Sidebar Navigation
- **Resources** - Main dashboard
- **Proposals** - Coming soon placeholder
- **AI Suggestions** - Coming soon placeholder

## 🔧 Customization

### Add New Resources
Edit `utils/data.ts` → `SAMPLE_RESOURCES` array

### Change Theme Colors
Edit `styles/theme.ts` → `brand` colors

### Add New Pages
Create a new folder in `/app` with a `page.tsx` file

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Docs](https://chakra-ui.com/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Full README](./README.md)

## ⚠️ Troubleshooting

**Wallet won't connect:**
- Ensure MetaMask or Web3 wallet is installed
- Check that you're on a supported network (Mainnet or Sepolia)
- Try refreshing the page

**Build errors:**
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Run `npm run build`

**Styling issues:**
- Clear browser cache
- Check that all Chakra UI components are imported correctly

## 💡 Tips

- Use the responsive design patterns from existing components
- All components have detailed code comments
- TypeScript interfaces are in `/types/index.ts`
- Check the README.md for comprehensive documentation
