// 🎙️ Minimal Voice Chat - Clean & Simple
// Streamlined voice interface matching the minimal design

import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import VoiceChatRecognition from '../utils/speechRecognition';
import { AudioPlayer as AudioPlayerClass } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';

const MinimalVoiceChat = ({ onBackToChat }) => {
  // Voice state management
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  
  // Conversation state
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const voiceRecognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Initialize voice recognition
  useEffect(() => {
    initializeVoiceChat();
    return () => cleanup();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeVoiceChat = async () => {
    try {
      const supported = VoiceChatRecognition.isSupported();
      setIsVoiceSupported(supported);
      
      if (!supported) {
        setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      // Request microphone permission
      const micResult = await VoiceChatRecognition.requestMicrophonePermission();
      if (!micResult.success) {
        setError('Microphone access is required for voice chat.');
        return;
      }

      // Initialize recognition
      voiceRecognitionRef.current = new VoiceChatRecognition();
      
      voiceRecognitionRef.current.setCallbacks({
        onResult: handleVoiceResult,
        onError: handleVoiceError,
        onStart: () => setVoiceState('listening'),
        onEnd: () => setVoiceState('idle'),
        onStateChange: setVoiceState
      });

      // Initialize audio player
      audioPlayerRef.current = new AudioPlayerClass();
      
      console.log('✅ Minimal voice chat initialized');
    } catch (error) {
      setError('Failed to initialize voice chat. Please refresh and try again.');
      console.error('Voice chat initialization error:', error);
    }
  };

  const handleVoiceResult = (result) => {
    if (result.finalTranscript && result.finalTranscript.trim().length < 2) {
      return;
    }

    setInterimTranscript(result.interimTranscript);
    
    if (result.isFinal && result.finalTranscript.trim()) {
      const finalText = result.finalTranscript.trim();
      setTranscript(finalText);
      setInterimTranscript('');
      sendVoiceMessage(finalText);
    }
  };

  const handleVoiceError = (error) => {
    setError(error.message || 'Voice recognition error occurred');
    setVoiceState('idle');
    setInterimTranscript('');
  };

  const sendVoiceMessage = async (message) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    setVoiceState('processing');
    setError(null);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      isVoice: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTranscript('');

    try {
      const result = await chatService.sendMessage(message);
      
      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto-play response
        await playResponse(result.data.response);
      } else {
        setError('Failed to get AI response. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setIsProcessing(false);
      setVoiceState('idle');
    }
  };

  const playResponse = async (text) => {
    if (!text || !audioPlayerRef.current) return;

    try {
      const result = await chatService.getAudio(text);
      if (result.success) {
        await audioPlayerRef.current.play(result.audioUrl);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const toggleVoiceRecording = () => {
    if (!voiceRecognitionRef.current) return;

    if (voiceState === 'listening') {
      voiceRecognitionRef.current.stopListening();
    } else {
      setError(null);
      voiceRecognitionRef.current.startListening();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
    if (voiceRecognitionRef.current && voiceState === 'listening') {
      voiceRecognitionRef.current.stopListening();
    }
  };

  const cleanup = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.destroy();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.destroy();
    }
  };

  const getMicrophoneButton = () => {
    const baseClasses = "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2";
    
    if (voiceState === 'listening') {
      return (
        <button
          onClick={toggleVoiceRecording}
          className={`${baseClasses} bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse`}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </button>
      );
    } else if (voiceState === 'processing') {
      return (
        <div className={`${baseClasses} bg-yellow-500 cursor-not-allowed`}>
          <LoadingSpinner size="md" color="white" />
        </div>
      );
    } else {
      return (
        <button
          onClick={toggleVoiceRecording}
          disabled={!isVoiceSupported}
          className={`${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-lg ${
            !isVoiceSupported ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Consistent Header - Same as Chat Mode */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">UsapAI</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Same Mode Toggle as Chat */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onBackToChat && onBackToChat()}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-white text-blue-600 shadow-sm"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Voice Conversation</h2>
              <p className="text-gray-500 mb-6">Start speaking with the microphone button below</p>
              
              {!isVoiceSupported && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-yellow-700">
                    Voice chat requires Chrome or Edge browser for optimal performance.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Clear Button - Above Messages */}
              <div className="flex justify-end">
                <button
                  onClick={clearConversation}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Conversation
                </button>
              </div>
              
              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                    
                    <div className={`mt-2 text-xs flex items-center justify-between ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.isVoice && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span>Voice</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-600 text-sm">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {(transcript || interimTranscript) && (
        <div className="border-t border-gray-100 bg-blue-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Speaking</span>
            </div>
            <p className="text-gray-900">
              {transcript}
              <span className="text-gray-500 italic">{interimTranscript}</span>
            </p>
          </div>
        </div>
      )}

      {/* Fixed Microphone Button - Bottom Center */}
      <div className="border-t border-gray-100 bg-white p-6">
        <div className="flex justify-center">
          {getMicrophoneButton()}
        </div>
        <div className="text-center mt-3">
          <p className="text-sm text-gray-500">
            {voiceState === 'listening' ? 'Listening... Speak now' :
             voiceState === 'processing' ? 'Processing your message...' :
             'Click to speak'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalVoiceChat;