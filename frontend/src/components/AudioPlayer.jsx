// 🔊 Audio Player Component - Professional audio playback with controls
// Handles text-to-speech generation and playback

import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import { AudioPlayer as AudioPlayerClass, audioUtils } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';

const AudioPlayer = ({ text, voice = 'alloy', minimal = false }) => {
  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioState, setAudioState] = useState('idle');
  const [error, setError] = useState(null);
  const [timeInfo, setTimeInfo] = useState({ currentTime: 0, duration: 0, progress: 0 });
  const [audioUrl, setAudioUrl] = useState(null);
  
  // Refs
  const audioPlayerRef = useRef(null);
  
  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayerClass();
    
    // Set up callbacks
    audioPlayerRef.current.setCallbacks({
      onStateChange: (state, timeData) => {
        setAudioState(state);
        setTimeInfo(timeData);
        setIsPlaying(state === 'playing');
      },
      onError: (error) => {
        setError('Audio playback failed');
        setIsPlaying(false);
        console.error('Audio error:', error);
      },
      onComplete: () => {
        setIsPlaying(false);
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.destroy();
      }
    };
  }, []);
  
  // Generate and play audio
  const handlePlayAudio = async () => {
    if (!text || isGenerating) return;
    
    setError(null);
    
    // If audio is already playing, stop it
    if (isPlaying) {
      audioPlayerRef.current.stop();
      return;
    }
    
    // If we already have audio, just play it
    if (audioUrl && audioState !== 'error') {
      const success = await audioPlayerRef.current.play(audioUrl);
      if (!success) {
        setError('Failed to play audio');
      }
      return;
    }
    
    // Generate new audio
    setIsGenerating(true);
    
    try {
      console.log('🔊 Generating audio for text:', text.substring(0, 50) + '...');
      
      const result = await chatService.getAudio(text, voice);
      
      if (result.success) {
        setAudioUrl(result.audioUrl);
        
        // Start playback
        const success = await audioPlayerRef.current.play(result.audioUrl);
        if (!success) {
          setError('Failed to play generated audio');
        }
        
        console.log('✅ Audio generated and playing');
      } else {
        setError(result.error.message || 'Failed to generate audio');
        console.error('TTS Error:', result.error);
      }
    } catch (err) {
      setError('Audio generation failed');
      console.error('Audio generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle pause/resume
  const handlePauseResume = async () => {
    if (audioState === 'playing') {
      audioPlayerRef.current.pause();
    } else if (audioState === 'paused') {
      await audioPlayerRef.current.resume();
    }
  };
  
  // Handle stop
  const handleStop = () => {
    audioPlayerRef.current.stop();
  };
  
  // Format time display
  const formatTime = (seconds) => audioUtils.formatTime(seconds);
  
  // Minimal version - just a simple voice button
  if (minimal) {
    return (
      <button
        onClick={handlePlayAudio}
        disabled={isGenerating || !text}
        className={`p-1.5 rounded-full transition-colors ${
          isGenerating
            ? 'bg-gray-200 text-gray-400'
            : isPlaying
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }`}
        title={isGenerating ? 'Generating...' : isPlaying ? 'Stop' : 'Play audio'}
      >
        {isGenerating ? (
          <LoadingSpinner size="xs" />
        ) : isPlaying ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.767 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.767l3.616-2.817a1 1 0 011 .893zM16 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
            <path d="M15.657 2.343a1 1 0 011.414 0A9.972 9.972 0 0120 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0018 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0116 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0014 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
          </svg>
        )}
      </button>
    );
  }
  
  // Full version with all controls
  const getButtonState = () => {
    if (isGenerating) return { text: 'Generating...', disabled: true, icon: '⏳' };
    if (isPlaying) return { text: 'Stop', disabled: false, icon: '⏹️' };
    if (audioState === 'paused') return { text: 'Resume', disabled: false, icon: '▶️' };
    if (audioUrl) return { text: 'Play Again', disabled: false, icon: '🔊' };
    return { text: 'Play Audio', disabled: false, icon: '🔊' };
  };
  
  const buttonState = getButtonState();
  
  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      {/* Main Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePlayAudio}
          disabled={buttonState.disabled || !text}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            buttonState.disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isGenerating ? (
            <LoadingSpinner size="xs" color="white" />
          ) : (
            <span>{buttonState.icon}</span>
          )}
          <span>{buttonState.text}</span>
        </button>
        
        {/* Additional controls when audio is available */}
        {audioUrl && audioState !== 'idle' && (
          <>
            {audioState === 'playing' && (
              <button
                onClick={handlePauseResume}
                className="p-1.5 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
                title="Pause"
              >
                ⏸️
              </button>
            )}
            
            {audioState === 'paused' && (
              <button
                onClick={handlePauseResume}
                className="p-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white"
                title="Resume"
              >
                ▶️
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="p-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white"
              title="Stop"
            >
              ⏹️
            </button>
          </>
        )}
        
        {/* Audio state indicator */}
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full ${
            audioState === 'playing' ? 'bg-green-500' :
            audioState === 'paused' ? 'bg-yellow-500' :
            audioState === 'loading' ? 'bg-blue-500' :
            audioState === 'error' ? 'bg-red-500' :
            'bg-gray-300'
          }`}></span>
          <span className="capitalize">{audioState}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      {audioUrl && timeInfo.duration > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(timeInfo.currentTime)}</span>
            <span>{formatTime(timeInfo.duration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${timeInfo.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠️ {error}
        </div>
      )}
      
      {/* Audio Info */}
      {audioUrl && !error && (
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>🎵 Voice: {voice}</span>
          <span>📝 {text.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
