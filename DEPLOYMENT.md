# 🚀 Deployment Guide

## ✅ GitHub Repository

**Repository URL**: https://github.com/yuvrajsharmaaa/RentMeUp

Your code has been successfully published to GitHub!

## 📦 What Was Committed

All project files have been committed and pushed:

- ✅ 25 files
- ✅ 9,789 lines of code
- ✅ Complete Next.js 14 application
- ✅ All documentation files
- ✅ Configuration files
- ✅ TypeScript types and components

## 🌐 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Easiest deployment for Next.js apps**

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select `RentMeUp` repository
4. **Configure**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Environment Variables** (Optional):
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```
6. **Deploy**: Click "Deploy"

**Result**: Your app will be live at `https://rent-me-up-*.vercel.app`

---

### Option 2: Netlify

1. **Go to Netlify**: https://netlify.com
2. **Import from Git**: Connect GitHub account
3. **Select Repository**: Choose `RentMeUp`
4. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Deploy**

---

### Option 3: Railway

1. **Go to Railway**: https://railway.app
2. **New Project** → Deploy from GitHub repo
3. **Select** `RentMeUp`
4. **Configure**:
   - Start command: `npm run start`
   - Build command: `npm run build`
5. **Deploy**

---

### Option 4: Self-Hosted (VPS/Cloud)

**Requirements**: Node.js 18+, npm

```bash
# Clone repository
git clone https://github.com/yuvrajsharmaaa/RentMeUp.git
cd RentMeUp

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start
# App runs on http://localhost:3000
```

**With PM2** (Process Manager):
```bash
npm install -g pm2
pm2 start npm --name "rentmeup" -- start
pm2 save
pm2 startup
```

---

## 🔐 Environment Variables

For production, set these environment variables:

```env
# Required for WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Custom RPC endpoints
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-KEY
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
```

**Get WalletConnect ID**: https://cloud.walletconnect.com

---

## 📊 Post-Deployment Checklist

After deploying, verify:

- [ ] App loads successfully
- [ ] All pages are accessible (/, /proposals, /ai-suggestions)
- [ ] Responsive design works on mobile
- [ ] Wallet connection works (test with MetaMask)
- [ ] Resource cards display correctly
- [ ] Navigation between pages works
- [ ] No console errors

---

## 🔄 Updating Your Deployment

### Making Changes

1. **Edit your code locally**
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin main
   ```

### Auto-Deployment

If deployed on Vercel/Netlify/Railway:
- **Automatic**: Changes pushed to `main` branch trigger automatic redeployment
- **No manual steps needed**

---

## 🌍 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

---

## 📈 Monitoring & Analytics

### Recommended Tools

**Vercel Analytics**:
- Built-in for Vercel deployments
- Real-time performance metrics

**Google Analytics**:
Add to `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

---

## 🐛 Troubleshooting

### Build Fails

**Check**:
- Node.js version (should be 18+)
- All dependencies installed
- No TypeScript errors: `npm run lint`

**Fix**:
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Environment Variables Not Working

- Ensure variables start with `NEXT_PUBLIC_`
- Restart the dev server after adding variables
- In production, set in deployment platform settings

### Wallet Connection Issues

- Verify WalletConnect Project ID is set
- Check browser console for errors
- Ensure MetaMask is installed and unlocked

---

## 📚 Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Actions**: For CI/CD pipelines

---

## 🎉 Success!

Your Web3 Campus Resources Dashboard is now:
- ✅ Published on GitHub: https://github.com/yuvrajsharmaaa/RentMeUp
- ✅ Ready for deployment
- ✅ Open source and collaborative

**Next Steps**:
1. Deploy to Vercel (5 minutes)
2. Add custom domain (optional)
3. Share with your team!

---

**Questions?** Check the README.md or open an issue on GitHub.
