#!/usr/bin/env node

/**
 * 🚀 Quick Vercel Deployment Helper
 * Step-by-step deployment guide
 */

console.log(`
🎉 CONVERSAAI VERCEL DEPLOYMENT GUIDE

📋 What You'll Need:
✅ GitHub account
✅ OpenAI API key
✅ 10 minutes of your time

🚀 OPTION 1: Quick Deploy (Recommended)

1️⃣ PUSH TO GITHUB
   git add .
   git commit -m "Ready for deployment"
   git push origin main

2️⃣ DEPLOY BACKEND (Railway - FREE)
   • Go to https://railway.app
   • Login with GitHub
   • Click "New Project" → "Deploy from GitHub repo"
   • Select your repo → Set root directory to "backend"
   • Add environment variables:
     - OPENAI_API_KEY=your_key_here
     - NODE_ENV=production
   • Copy your Railway URL (e.g., https://xxx.railway.app)

3️⃣ DEPLOY FRONTEND (Vercel - FREE)
   • Go to https://vercel.com
   • Login with GitHub
   • Import your GitHub repo
   • Set root directory to "frontend"
   • Add environment variable:
     - REACT_APP_API_URL=https://your-railway-url.railway.app
   • Deploy!

4️⃣ UPDATE CORS (Important!)
   • Go back to Railway dashboard
   • Add environment variable:
     - FRONTEND_URL=https://your-vercel-url.vercel.app
   • Redeploy backend

✅ DONE! Your app is live!

🎯 DEMO READY:
• Beautiful minimal interface
• Text and voice chat
• Perfect for interviews
• Shareable public URL

💁‍♂️ Need help? Run: node deploy.js

🚀 Happy deploying!
`);
