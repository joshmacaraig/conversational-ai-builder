# 🚀 Deploy ConversaAI to Vercel - Complete Guide

## 📋 Deployment Strategy
- **Frontend**: Vercel (perfect for React apps)
- **Backend**: Railway (free tier, easy Node.js deployment)
- **Result**: Fully functional public demo for interviews!

## 🎯 Step 1: Prepare Frontend for Deployment

### Update API Configuration
First, let's create environment-based API configuration:

```javascript
// frontend/src/config/api.js
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001'
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app'
  }
};

export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};
```

### Update API Service
```javascript
// frontend/src/services/api.js - Update this section
import { getApiConfig } from '../config/api';

const API_BASE_URL = getApiConfig().baseURL;
// ... rest of your API service code
```

## 🎯 Step 2: Deploy Backend to Railway

### Railway Setup (Free & Easy)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your repository
6. Choose the `backend` folder

### Backend Railway Configuration
Create `railway.toml` in your backend folder:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Update Backend for Production
Add health check endpoint to your backend:
```javascript
// backend/src/server.js - Add this route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ConversaAI Backend'
  });
});
```

## 🎯 Step 3: Deploy Frontend to Vercel

### Install Vercel CLI
```bash
npm install -g vercel
```

### Frontend Vercel Configuration
Create `vercel.json` in your frontend folder:
```json
{
  "name": "conversaai-frontend",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

### Update Package.json Build Script
Make sure your frontend package.json has:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🎯 Step 4: Environment Variables Setup

### Backend Environment Variables (Railway)
In Railway dashboard, go to Variables tab and add:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables (Vercel)
In Vercel dashboard, go to Settings → Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## 🚀 Step 5: Deployment Commands

### Deploy Backend First
```bash
# Push to GitHub (Railway will auto-deploy)
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

## 🎯 Step 6: Quick Deployment Script

Let me create an automated deployment script for you:
