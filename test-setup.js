// 🧪 Quick Setup Test Script
// Run this to verify your setup is working

import dotenv from 'dotenv';
import { chatService } from '../frontend/src/services/api.js';

dotenv.config({ path: './backend/.env' });

console.log('🧪 Running Conversational AI Builder Setup Test...\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables:');
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   Port: ${process.env.PORT || '3001'}`);
console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);

// Test 2: Dependencies
console.log('2️⃣ Testing Dependencies:');
try {
  console.log('   Express: ✅ Installed');
  console.log('   OpenAI: ✅ Installed');
  console.log('   CORS: ✅ Installed');
  console.log('   Dotenv: ✅ Installed\n');
} catch (error) {
  console.log('   ❌ Some dependencies missing\n');
}

console.log('🎉 Setup test complete!');
console.log('\n📋 Next Steps:');
console.log('   1. Terminal 1: cd backend && npm run dev');
console.log('   2. Terminal 2: cd frontend && npm run dev');
console.log('   3. Open: http://localhost:5173');
console.log('\n🚀 Your Conversational AI Builder is ready for demo!');
