// 🧪 Simple API Key Test (No imports needed)
console.log('🧪 Testing OpenAI API Key Setup...\n');

// Read the .env file manually
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, 'backend', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract API key from .env content
  const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
  
  if (!apiKeyMatch) {
    console.log('❌ No OPENAI_API_KEY found in .env file');
    console.log('💡 Please add your OpenAI API key to backend/.env file\n');
    process.exit(1);
  }
  
  const apiKey = apiKeyMatch[1].trim();
  
  if (!apiKey || apiKey === 'PASTE_YOUR_NEW_API_KEY_HERE') {
    console.log('❌ Please replace the placeholder with your actual API key');
    console.log('🔗 Visit: https://platform.openai.com/api-keys');
    console.log('📝 Update the OPENAI_API_KEY in backend/.env file\n');
    process.exit(1);
  }
  
  if (apiKey.length < 20) {
    console.log('❌ API key seems too short. Please check your key.');
    process.exit(1);
  }
  
  console.log('✅ API key found in backend/.env file');
  console.log(`🔑 Key preview: ${apiKey.substring(0, 20)}...`);
  console.log(`📏 Key length: ${apiKey.length} characters`);
  
  if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) {
    console.log('✅ Key format looks correct');
  } else {
    console.log('⚠️  Key format might be incorrect (should start with sk- or sk-proj-)');
  }
  
  console.log('\n🚀 Configuration looks good!');
  console.log('📋 Next steps:');
  console.log('1. Open two terminals');
  console.log('2. Terminal 1: cd backend && npm run dev');
  console.log('3. Terminal 2: cd frontend && npm run dev');
  console.log('4. Visit http://localhost:5173 in your browser\n');
  
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
  console.log('💡 Make sure you have a .env file in the backend folder\n');
}
