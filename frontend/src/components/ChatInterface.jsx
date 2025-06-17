// 💬 Professional Chat Interface - Interview Ready Design
// Clean, modern interface with high contrast and professional styling

import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import AudioPlayer from './AudioPlayer';
import LoadingSpinner from './LoadingSpinner';

const ChatInterface = ({ hideHeader = false }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection on component mount
  useEffect(() => {
    if (!hideHeader) {
      checkConnection();
    }
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [hideHeader]);

  // Check API connection
  const checkConnection = async () => {
    try {
      const result = await chatService.checkHealth();
      setIsConnected(result.success);
      if (!result.success) {
        setError('Unable to connect to the server. Please ensure the backend is running.');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Failed to connect to the server.');
    }
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      // Send message to API
      const result = await chatService.sendMessage(userMessage);
      
      if (result.success) {
        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.data.response,
          timestamp: new Date(),
          metadata: {
            model: result.data.model,
            usage: result.data.usage,
            responseTime: result.data.responseTime
          }
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle API error
        setError(result.error.message || 'Failed to get AI response');
        console.error('API Error:', result.error);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Suggestion prompts for demo
  const suggestionPrompts = [
    "Explain artificial intelligence in simple terms",
    "What are the benefits of AI in healthcare?",
    "How does machine learning work?",
    "Write a creative story about the future of technology"
  ];

  const handleSuggestionClick = (prompt) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className={`flex flex-col ${hideHeader ? 'h-full' : 'h-screen'} bg-gradient-to-br from-slate-50 to-blue-50`}>
      {/* Professional Header - Only show if not hidden */}
      {!hideHeader && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ConversaAI Studio</h1>
                  <p className="text-sm text-gray-600">Professional AI Assistant with Voice Synthesis</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected === null ? 'bg-yellow-500 animate-pulse' :
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected === null ? 'Connecting...' :
                     isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Clear Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-500 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 sm:py-20 px-4">
              <div className="flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 sm:mb-8">
                <svg className="w-10 h-10 sm:w-14 sm:h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Text Chat Mode</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl sm:max-w-4xl mx-auto leading-relaxed">
                Type your questions below and get intelligent AI responses. 
                Each response can also be converted to speech for a complete conversational experience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-2xl sm:max-w-3xl mx-auto">
                {suggestionPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="group p-4 sm:p-5 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm sm:text-base text-gray-800 font-medium group-hover:text-gray-900 transition-colors">
                          {prompt}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 sm:space-x-3 max-w-xs sm:max-w-2xl lg:max-w-3xl ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200'
                    }`}>
                      {message.type === 'user' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {message.content}
                      </p>
                      
                      {/* AI Message Footer */}
                      {message.type === 'ai' && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <AudioPlayer text={message.content} />
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {message.metadata?.usage && (
                            <span className="text-xs text-gray-500">
                              {message.metadata.usage.totalTokens} tokens
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* User Message Footer */}
                      {message.type === 'user' && (
                        <div className="mt-2 text-right">
                          <span className="text-xs text-blue-200">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-gray-600 font-medium">AI is processing your request...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Professional Input Area - MOBILE OPTIMIZED & STICKY */}
      <div className="bg-white border-t border-gray-200 shadow-lg sticky bottom-0 z-50 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5">
          {/* Clear Chat Button for when header is hidden */}
          {hideHeader && messages.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Clear Chat
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (Press Enter to send)"
                className="w-full px-4 py-3 sm:py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white resize-none transition-all duration-200 font-medium text-base leading-tight"
                rows={1}
                style={{ 
                  minHeight: '52px', 
                  maxHeight: '132px',
                  fontSize: '16px', // Prevents zoom on mobile
                  lineHeight: '1.4'
                }}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="flex items-center justify-center px-5 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[90px] sm:min-w-[100px] h-[52px] sm:h-[60px] shadow-lg touch-manipulation"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <span className="font-semibold">Send</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium hidden sm:inline">Powered by OpenAI GPT with voice synthesis</span>
              <span className="font-medium sm:hidden">AI + Voice</span>
            </div>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {inputMessage.length}/1000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;