// 🎯 Minimal App Component - Clean and Simple
// Focus on core chat functionality without clutter

import React, { useState, useEffect } from 'react';
import MinimalChat from './components/MinimalChat';
import { chatService } from './services/api';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [error, setError] = useState(null);

  // Initialize app and check connection
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing ConversaAI...');
      
      // Check backend health
      const healthResult = await chatService.checkHealth();
      
      if (healthResult.success) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection established');
      } else {
        setConnectionStatus('disconnected');
        setError('Backend server is not responding. Please ensure it is running on port 3001.');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to connect to backend. Please check if the server is running.');
      console.error('❌ App initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry connection
  const retryConnection = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      initializeApp();
    }, 1000);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">ConversaAI</h1>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 mx-auto bg-red-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Connection Failed</h1>
          <p className="text-gray-600">{error || 'Unable to connect to the AI service.'}</p>
          <button
            onClick={retryConnection}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Main minimal app
  return <MinimalChat />;
}

export default App;