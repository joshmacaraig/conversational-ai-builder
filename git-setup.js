#!/usr/bin/env node

/**
 * 🚀 Git Setup & Deployment Helper
 * Initialize Git repository and prepare for deployment
 */

console.log(`
🎯 GIT SETUP & DEPLOYMENT GUIDE

🔧 STEP 1: Initialize Git Repository
Run these commands in your project root:

git init
git add .
git commit -m "Initial commit - ConversaAI minimal interface"

🔗 STEP 2: Connect to GitHub
1. Go to https://github.com
2. Click "New repository"
3. Name it: conversational-ai-builder
4. Don't initialize with README (we already have files)
5. Click "Create repository"

📤 STEP 3: Push to GitHub
Copy the commands GitHub shows you, something like:

git remote add origin https://github.com/yourusername/conversational-ai-builder.git
git branch -M main
git push -u origin main

🚀 STEP 4: Now Deploy!
After pushing to GitHub:

1️⃣ DEPLOY BACKEND (Railway)
   • https://railway.app
   • Login with GitHub
   • New Project → Deploy from GitHub repo
   • Root directory: backend
   • Environment variables:
     - OPENAI_API_KEY=your_key_here
     - NODE_ENV=production

2️⃣ DEPLOY FRONTEND (Vercel)  
   • https://vercel.com
   • Login with GitHub
   • Import your GitHub repo
   • Root directory: frontend
   • Environment variable:
     - REACT_APP_API_URL=https://your-railway-url.railway.app

3️⃣ UPDATE CORS
   • In Railway, add:
     - FRONTEND_URL=https://your-vercel-url.vercel.app

✅ DONE! Your ConversaAI will be live!

💡 Pro tip: Keep your OpenAI API key secure and never commit it to Git!
`);
