// 🛣️ Chat Routes - API endpoints for conversational AI functionality
// Handles text generation and text-to-speech requests

import express from 'express';
import { generateResponse, textToSpeech, testConnection } from '../services/openai.js';

const router = express.Router();

/**
 * 💬 POST /api/chat - Generate AI text response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Validate request
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required',
        code: 'MISSING_MESSAGE'
      });
    }

    console.log(`📨 Chat request: "${message.substring(0, 50)}..."`);

    // Generate AI response
    const result = await generateResponse(message, conversationHistory);
    
    if (result.success) {
      res.json({
        success: true,
        response: result.text,
        usage: result.usage,
        model: result.model,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      // Return appropriate status code based on error type
      const statusCode = result.code === 'INVALID_API_KEY' ? 401 :
                        result.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                        result.code === 'INSUFFICIENT_QUOTA' ? 402 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('❌ Chat route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in chat endpoint',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * 🔊 POST /api/text-to-speech - Convert text to audio
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    // Validate request
    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: 'Text is required for speech synthesis',
        code: 'MISSING_TEXT'
      });
    }

    console.log(`🔊 TTS request: ${text.length} characters`);

    // Generate speech
    const result = await textToSpeech(text, voice);
    
    if (result.success) {
      // Set appropriate headers for audio response
      res.set({
        'Content-Type': result.mimeType,
        'Content-Length': result.audioBuffer.length,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Audio-Info': JSON.stringify({
          voice: result.voice,
          textLength: result.textLength,
          audioSize: result.audioSize,
          responseTime: result.responseTime
        })
      });
      
      res.send(result.audioBuffer);
    } else {
      // Return appropriate status code based on error type
      const statusCode = result.code === 'INVALID_API_KEY' ? 401 :
                        result.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                        result.code === 'INSUFFICIENT_QUOTA' ? 402 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('❌ Text-to-speech route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in text-to-speech endpoint',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * 🧪 GET /api/test - Test OpenAI connection
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 API connection test requested');
    
    const result = await testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        model: result.model,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ Test route error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      details: error.message
    });
  }
});

/**
 * 📊 GET /api/status - API status and configuration
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'API is running',
    endpoints: {
      chat: 'POST /api/chat',
      textToSpeech: 'POST /api/text-to-speech',
      test: 'GET /api/test',
      status: 'GET /api/status'
    },
    configuration: {
      maxTokens: process.env.MAX_TOKENS || 200,
      temperature: process.env.TEMPERATURE || 0.7,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      hasApiKey: !!process.env.OPENAI_API_KEY
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;