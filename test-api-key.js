// 🧪 Quick API Key Test Script
// Run this to verify your OpenAI API key is working

import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

async function testApiKey() {
  console.log('🧪 Testing OpenAI API Key...\n');
  
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ No API key found in .env file');
    console.log('💡 Please add your OpenAI API key to the .env file\n');
    return;
  }
  
  if (process.env.OPENAI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
    console.log('❌ Please replace the placeholder with your actual API key');
    console.log('🔗 Visit: https://platform.openai.com/api-keys\n');
    return;
  }
  
  console.log('✅ API key found in environment');
  console.log(`🔑 Key preview: ${process.env.OPENAI_API_KEY.substring(0, 20)}...\n`);
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('🤖 Testing connection with a simple request...');
    
    // Make a test request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, API test successful!' in exactly those words."
        }
      ],
      max_tokens: 20,
      temperature: 0
    });
    
    const response = completion.choices[0].message.content;
    console.log(`🎉 API Response: "${response}"`);
    console.log(`📊 Tokens used: ${completion.usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${(completion.usage.total_tokens * 0.002 / 1000).toFixed(6)}\n`);
    
    console.log('✅ SUCCESS! Your API key is working perfectly!');
    console.log('🚀 You can now start your Conversational AI Builder demo\n');
    
  } catch (error) {
    console.log('❌ API Test Failed:');
    
    if (error.status === 401) {
      console.log('🔑 Invalid API key - please check your key is correct');
      console.log('💡 Get a new one at: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      console.log('⏰ Rate limit exceeded - wait a moment and try again');
    } else if (error.status === 402) {
      console.log('💳 Billing issue - check your OpenAI account billing');
    } else {
      console.log(`🐛 Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the test
testApiKey();
