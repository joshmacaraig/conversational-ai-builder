#!/usr/bin/env node

/**
 * 🚀 ConversaAI Deployment Script
 * Automated deployment to Vercel + Railway
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting ConversaAI Deployment Process...\n');

const deploymentSteps = [
  {
    name: 'Frontend Build Test',
    command: 'cd frontend && npm run build',
    description: 'Testing frontend build process'
  },
  {
    name: 'Backend Dependencies Check',
    command: 'cd backend && npm install',
    description: 'Verifying backend dependencies'
  }
];

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

async function deployConversaAI() {
  console.log('📋 Pre-deployment Checklist:\n');
  
  for (const step of deploymentSteps) {
    console.log(`⏳ ${step.description}...`);
    
    try {
      const result = await runCommand(step.command);
      console.log(`✅ ${step.name} completed successfully\n`);
    } catch (error) {
      console.log(`❌ ${step.name} failed:`);
      console.log(error.stderr || error.error.message);
      console.log('\nPlease fix the issues and try again.\n');
      return;
    }
  }
  
  console.log('🎉 Pre-deployment checks passed!\n');
  
  console.log('📝 Next Steps for Manual Deployment:\n');
  
  console.log('🔧 STEP 1: Deploy Backend to Railway');
  console.log('1. Go to https://railway.app');
  console.log('2. Sign up/login with GitHub');
  console.log('3. Click "New Project" → "Deploy from GitHub repo"');
  console.log('4. Select your repository');
  console.log('5. Set root directory to: backend');
  console.log('6. Add environment variables:');
  console.log('   - OPENAI_API_KEY=your_key_here');
  console.log('   - NODE_ENV=production');
  console.log('   - FRONTEND_URL=https://your-frontend-url.vercel.app');
  console.log('7. Deploy and copy the backend URL\n');
  
  console.log('🎨 STEP 2: Deploy Frontend to Vercel');
  console.log('1. Install Vercel CLI: npm install -g vercel');
  console.log('2. Login: vercel login');
  console.log('3. Go to frontend folder: cd frontend');
  console.log('4. Deploy: vercel --prod');
  console.log('5. Add environment variable in Vercel dashboard:');
  console.log('   - REACT_APP_API_URL=https://your-backend-url.railway.app\n');
  
  console.log('🔗 STEP 3: Update CORS Settings');
  console.log('1. Update FRONTEND_URL in Railway to your Vercel URL');
  console.log('2. Redeploy backend\n');
  
  console.log('✅ Your ConversaAI will be live at your Vercel URL!');
  console.log('🎯 Perfect for interviews and portfolio demos!\n');
}

deployConversaAI().catch(console.error);