// 🤖 OpenAI Service - Text Generation & Speech Synthesis
// Professional integration with comprehensive error handling

import OpenAI from 'openai';

// Lazy initialization - create client only when needed
let openai = null;
let initializationAttempted = false;

/**
 * Initialize OpenAI client (called on first use)
 */
function initializeOpenAI() {
  if (initializationAttempted) return openai;
  
  initializationAttempted = true;
  
  try {
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI client initialized successfully');
    } else {
      console.log('⚠️  OpenAI API key not found - API functions will return helpful errors');
    }
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error.message);
  }
  
  return openai;
}

/**
 * 💬 Generate AI response using OpenAI GPT model
 * @param {string} prompt - User's input message
 * @param {Array} conversationHistory - Previous messages for context (optional)
 * @returns {Object} Response object with success status and data
 */
export async function generateResponse(prompt, conversationHistory = []) {
  try {
    // Initialize OpenAI client on first use
    const client = initializeOpenAI();
    
    // Check if OpenAI client is available
    if (!client) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.',
        code: 'API_KEY_MISSING'
      };
    }

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Valid prompt is required');
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    // Build conversation messages
    const messages = [
      {
        role: "system",
        content: `You are a helpful, professional AI assistant for a conversational AI demo. 
        Provide clear, concise, and engaging responses. 
        Keep responses under 150 words unless specifically asked for longer explanations.
        Be conversational but professional, perfect for demonstrating AI capabilities.`
      },
      // Add conversation history if provided
      ...conversationHistory,
      {
        role: "user",
        content: trimmedPrompt
      }
    ];

    console.log(`🤖 Generating response for: "${trimmedPrompt.substring(0, 50)}..."`);
    const startTime = Date.now();

    // Make API call to OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: parseInt(process.env.MAX_TOKENS) || 200,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const responseTime = Date.now() - startTime;

    // Extract response
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response generated from OpenAI');
    }

    console.log(`✅ Response generated in ${responseTime}ms (${completion.usage.total_tokens} tokens)`);

    return {
      success: true,
      text: responseText.trim(),
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      },
      model: completion.model,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('❌ OpenAI Text Generation Error:', error.message);
    
    // Handle specific OpenAI errors
    if (error.status) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            error: 'Invalid OpenAI API key. Please check your configuration.',
            code: 'INVALID_API_KEY'
          };
        case 429:
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again in a moment.',
            code: 'RATE_LIMIT_EXCEEDED'
          };
        case 402:
          return {
            success: false,
            error: 'Insufficient credits. Please check your OpenAI billing.',
            code: 'INSUFFICIENT_QUOTA'
          };
        default:
          return {
            success: false,
            error: `API Error: ${error.message}`,
            code: 'API_ERROR'
          };
      }
    }

    // Generic error handling
    return {
      success: false,
      error: error.message || 'Failed to generate AI response',
      code: 'UNKNOWN_ERROR'
    };
  }
}

/**
 * 🔊 Generate audio from text using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Object} Response object with audio buffer or error
 */
export async function textToSpeech(text, voice = 'alloy') {
  try {
    // Initialize OpenAI client on first use
    const client = initializeOpenAI();
    
    // Check if OpenAI client is available
    if (!client) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.',
        code: 'API_KEY_MISSING'
      };
    }

    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Valid text is required for speech synthesis');
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Limit text length (OpenAI TTS has a 4096 character limit)
    const maxLength = 4000;
    const processedText = trimmedText.length > maxLength ? 
      trimmedText.substring(0, maxLength) + '...' : trimmedText;

    // Validate voice option
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

    console.log(`🔊 Generating speech for ${processedText.length} characters with voice: ${selectedVoice}`);
    const startTime = Date.now();

    // Generate speech
    const mp3Response = await client.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: processedText,
      response_format: "mp3",
      speed: 1.0
    });

    const responseTime = Date.now() - startTime;

    // Convert to buffer
    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    
    console.log(`✅ Speech generated in ${responseTime}ms (${audioBuffer.length} bytes)`);

    return {
      success: true,
      audioBuffer: audioBuffer,
      mimeType: 'audio/mpeg',
      voice: selectedVoice,
      textLength: processedText.length,
      audioSize: audioBuffer.length,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('❌ OpenAI Text-to-Speech Error:', error.message);
    
    // Handle specific OpenAI errors
    if (error.status) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            error: 'Invalid OpenAI API key for TTS service.',
            code: 'INVALID_API_KEY'
          };
        case 429:
          return {
            success: false,
            error: 'TTS rate limit exceeded. Please try again shortly.',
            code: 'RATE_LIMIT_EXCEEDED'
          };
        case 402:
          return {
            success: false,
            error: 'Insufficient credits for TTS service.',
            code: 'INSUFFICIENT_QUOTA'
          };
        default:
          return {
            success: false,
            error: `TTS API Error: ${error.message}`,
            code: 'TTS_API_ERROR'
          };
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to generate speech',
      code: 'TTS_UNKNOWN_ERROR'
    };
  }
}

/**
 * 🧪 Test OpenAI connection
 * @returns {Object} Connection test result
 */
export async function testConnection() {
  try {
    console.log('🧪 Testing OpenAI connection...');
    
    // Initialize OpenAI client on first use
    const client = initializeOpenAI();
    
    // Check if OpenAI client is available
    if (!client) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.',
        code: 'API_KEY_MISSING'
      };
    }
    
    const testResult = await generateResponse('Hello, this is a connection test.');
    
    if (testResult.success) {
      console.log('✅ OpenAI connection test successful');
      return {
        success: true,
        message: 'OpenAI connection is working properly',
        model: testResult.model,
        responseTime: testResult.responseTime
      };
    } else {
      return testResult;
    }
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error.message);
    return {
      success: false,
      error: 'Connection test failed',
      details: error.message
    };
  }
}