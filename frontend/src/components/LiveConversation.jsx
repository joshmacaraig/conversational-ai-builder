// 🎙️ Modern Voice Chat Interface - Premium Demo Design
// Impressive, modern interface that wows during presentations

import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import VoiceChatRecognition from '../utils/speechRecognition';
import { AudioPlayer as AudioPlayerClass } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';

const LiveConversation = ({ onBackToChat }) => {
  // Voice state management
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  
  // Conversation state
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.8);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Refs
  const voiceRecognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Initialize voice recognition and audio player
  useEffect(() => {
    initializeVoiceChat();
    
    return () => {
      cleanup();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeVoiceChat = async () => {
    try {
      const supported = VoiceChatRecognition.isSupported();
      setIsVoiceSupported(supported);
      
      if (!supported) {
        setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      // Request microphone permission first
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
      
      console.log('✅ Voice chat initialized successfully');
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
          timestamp: new Date(),
          metadata: result.data
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (isAutoPlay) {
          await playResponse(result.data.response);
        }
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
        const audio = new Audio(result.audioUrl);
        audio.volume = audioVolume;
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

  const handlePushToTalkStart = () => {
    if (isPushToTalk && voiceRecognitionRef.current) {
      setError(null);
      voiceRecognitionRef.current.startListening();
    } else {
      toggleVoiceRecording();
    }
  };

  const handlePushToTalkEnd = () => {
    if (isPushToTalk && voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stopListening();
    }
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    stopAudio();
    if (voiceRecognitionRef.current && voiceState === 'listening') {
      voiceRecognitionRef.current.stopListening();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.destroy();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.destroy();
    }
  };

  const getVoiceVisualization = () => {
    switch (voiceState) {
      case 'listening':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-30"></div>
            <div className="absolute -inset-4 rounded-full border-2 border-red-200 animate-ping opacity-20" style={{animationDelay: '0.5s'}}></div>
          </div>
        );
      case 'processing':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-pulse opacity-40"></div>
          </div>
        );
      default:
        return (
          <div className="relative group cursor-pointer" onClick={!isPushToTalk ? toggleVoiceRecording : undefined}>
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-300 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Premium Settings Panel */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Voice Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Voice Mode</label>
              <div className="flex items-center bg-gray-100 rounded-xl p-1.5 shadow-inner">
                <button
                  onClick={() => setIsPushToTalk(false)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    !isPushToTalk
                      ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Continuous</span>
                  </div>
                </button>
                <button
                  onClick={() => setIsPushToTalk(true)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isPushToTalk
                      ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Push-to-talk</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Audio Volume</label>
                <div className="flex items-center space-x-4 bg-white/60 rounded-xl px-4 py-3 shadow-sm backdrop-blur-sm">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg appearance-none cursor-pointer slider-modern"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 min-w-[40px] bg-gray-100 px-2 py-1 rounded-lg">
                    {Math.round(audioVolume * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full transition-colors duration-200 ${isAutoPlay ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Auto-play AI responses</span>
                </div>
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isAutoPlay ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAutoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              {onBackToChat && (
                <button
                  onClick={onBackToChat}
                  className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Chat</span>
                  </div>
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Chat</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 mx-8 mt-6">
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Voice Interface */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        {messages.length === 0 ? (
          <div className="text-center space-y-12">
            {/* Voice Visualization */}
            <div className="flex justify-center">
              {getVoiceVisualization()}
            </div>
            
            {/* Status and Instructions */}
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Voice Chat Mode
                </h2>
                <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className={`w-3 h-3 rounded-full ${
                    voiceState === 'listening' ? 'bg-red-500 animate-pulse' :
                    voiceState === 'processing' ? 'bg-yellow-500 animate-spin' : 
                    'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {voiceState === 'listening' ? 'Listening...' :
                     voiceState === 'processing' ? 'Processing...' : 
                     'Ready'}
                  </span>
                </div>
              </div>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {isPushToTalk 
                  ? 'Hold the microphone button and speak your question clearly. Release when finished.'
                  : 'Click the microphone to start a continuous voice conversation with AI. Speak naturally and I\'ll respond with both text and voice.'
                }
              </p>
              
              {!isVoiceSupported && (
                <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-yellow-800">Browser Compatibility Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">Voice chat requires Chrome or Edge browser for optimal performance.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-4 max-w-3xl ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200'
                  }`}>
                    {message.type === 'user' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white/80 border border-gray-200 text-gray-900'
                  }`}>
                    <p className="leading-relaxed text-lg">
                      {message.content}
                    </p>
                    
                    <div className={`mt-3 text-sm flex items-center space-x-3 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.isVoice && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span>Voice</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-4 max-w-3xl">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 shadow-lg">
                    <div className="flex items-center space-x-4">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-700 font-medium text-lg">AI is processing your voice input...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Transcript & Audio Status */}
      {((transcript || interimTranscript) || isPlaying) && (
        <div className="relative z-10 mx-8 mb-6 space-y-4">
          {/* Live Transcript */}
          {(transcript || interimTranscript) && (
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Live Voice Input</span>
              </div>
              <div className="text-gray-900 text-lg font-medium">
                {transcript}
                <span className="text-gray-500 italic font-normal">{interimTranscript}</span>
              </div>
            </div>
          )}

          {/* Audio Playing Status */}
          {isPlaying && (
            <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-700 uppercase tracking-wider">AI Response</div>
                    <div className="text-lg font-medium text-green-800">Speaking...</div>
                  </div>
                </div>
                <button
                  onClick={stopAudio}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
                >
                  Stop Audio
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Voice Button */}
      {isPushToTalk && (
        <div className="relative z-10 pb-8">
          <div className="flex justify-center">
            <button
              onMouseDown={handlePushToTalkStart}
              onMouseUp={handlePushToTalkEnd}
              onTouchStart={handlePushToTalkStart}
              onTouchEnd={handlePushToTalkEnd}
              disabled={!isVoiceSupported}
              className={`w-20 h-20 rounded-full transition-all duration-300 transform active:scale-90 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl ${
                voiceState === 'listening' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } ${!isVoiceSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm font-medium text-gray-700">
              {voiceState === 'listening' ? 'Release to stop' : 'Hold to speak'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveConversation;