// 🌐 API Service - Frontend integration with Vercel proxy routes
// Professional HTTP client with error handling
// Updated to use Vercel API routes that proxy to Railway backend

import axios from 'axios';

// Use Vercel API routes instead of Railway directly to bypass CORS
const API_BASE_URL = ''; // Empty because we're using same origin (Vercel)

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

/**
 * Chat Service - Handles all conversational AI interactions via Vercel proxy
 */
export const chatService = {
  /**
   * 💬 Send message to AI and get text response
   */
  async sendMessage(message, conversationHistory = []) {
    try {
      const response = await apiClient.post('/api/chat', {
        message: message.trim(),
        conversationHistory
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: error.response?.status
      };
    }
  },

  /**
   * 🔊 Convert text to speech
   */
  async getAudio(text, voice = 'alloy') {
    try {
      const response = await apiClient.post(
        '/api/text-to-speech',
        { text: text.trim(), voice },
        { 
          responseType: 'blob',
          timeout: 45000 // Longer timeout for audio generation
        }
      );
      
      // Create audio blob and URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return {
        success: true,
        audioUrl,
        audioBlob
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: error.response?.status
      };
    }
  },

  /**
   * 🏥 Check API health via Vercel proxy
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/api/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: error.response?.status
      };
    }
  },

  /**
   * Handle API errors with user-friendly messages
   */
  handleError(error) {
    if (!error.response) {
      // Network error
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'network',
        technical: error.message
      };
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data.error || 'Invalid request. Please check your input.',
          type: 'validation',
          code: data.code
        };
      case 401:
        return {
          message: 'API key authentication failed. Please check the server configuration.',
          type: 'auth',
          code: data.code
        };
      case 402:
        return {
          message: 'Insufficient credits. Please check your OpenAI billing.',
          type: 'billing',
          code: data.code
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'rate_limit',
          code: data.code
        };
      case 500:
        return {
          message: data.error || 'Server error. Please try again later.',
          type: 'server',
          code: data.code
        };
      default:
        return {
          message: `Unexpected error (${status}). Please try again.`,
          type: 'unknown',
          status,
          details: data
        };
    }
  }
};

export default chatService;
