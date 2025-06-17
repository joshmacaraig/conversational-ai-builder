// 🎵 Audio Utilities - Professional audio playback management
// Handles audio lifecycle, cleanup, and state management

/**
 * AudioPlayer Class - Manages audio playback with proper cleanup
 */
export class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.onStateChange = null;
    this.onError = null;
    this.onComplete = null;
    
    // Bind methods to preserve context
    this.handleEnded = this.handleEnded.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleLoadStart = this.handleLoadStart.bind(this);
    this.handleCanPlay = this.handleCanPlay.bind(this);
  }

  /**
   * 🔊 Play audio from URL or blob
   */
  async play(audioUrl, options = {}) {
    try {
      // Stop any currently playing audio
      this.stop();
      
      // Create new audio element
      this.audio = new Audio(audioUrl);
      
      // Configure audio settings
      this.audio.volume = options.volume || 1.0;
      this.audio.playbackRate = options.speed || 1.0;
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Update state
      this.isPlaying = true;
      this.notifyStateChange('loading');
      
      // Start playback
      await this.audio.play();
      
      console.log('🎵 Audio playback started');
      this.notifyStateChange('playing');
      
      return true;
    } catch (error) {
      console.error('❌ Audio playback failed:', error);
      this.isPlaying = false;
      this.notifyStateChange('error');
      this.notifyError(error);
      return false;
    }
  }

  /**
   * ⏸️ Pause audio playback
   */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.isPlaying = false;
      this.notifyStateChange('paused');
      console.log('⏸️ Audio paused');
    }
  }

  /**
   * ▶️ Resume audio playback
   */
  async resume() {
    if (this.audio && this.audio.paused) {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.notifyStateChange('playing');
        console.log('▶️ Audio resumed');
        return true;
      } catch (error) {
        console.error('❌ Audio resume failed:', error);
        this.notifyError(error);
        return false;
      }
    }
    return false;
  }

  /**
   * ⏹️ Stop audio playback and cleanup
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.cleanup();
    }
    this.isPlaying = false;
    this.notifyStateChange('stopped');
    console.log('⏹️ Audio stopped');
  }

  /**
   * 🎛️ Set audio volume (0.0 to 1.0)
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * ⚡ Set playback speed (0.25 to 4.0)
   */
  setSpeed(speed) {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.25, Math.min(4, speed));
    }
  }

  /**
   * 📊 Get current playback state
   */
  getState() {
    if (!this.audio) return 'idle';
    if (this.audio.ended) return 'ended';
    if (this.audio.paused) return 'paused';
    if (this.isPlaying) return 'playing';
    return 'loading';
  }

  /**
   * ⏱️ Get current playback time info
   */
  getTimeInfo() {
    if (!this.audio) {
      return { currentTime: 0, duration: 0, progress: 0 };
    }
    
    const currentTime = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    return { currentTime, duration, progress };
  }

  /**
   * 🎯 Set playback position (in seconds)
   */
  seek(time) {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }

  /**
   * Set up event listeners for audio element
   */
  setupEventListeners() {
    if (!this.audio) return;
    
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
    this.audio.addEventListener('loadstart', this.handleLoadStart);
    this.audio.addEventListener('canplay', this.handleCanPlay);
  }

  /**
   * Clean up event listeners and resources
   */
  cleanup() {
    if (this.audio) {
      // Remove event listeners
      this.audio.removeEventListener('ended', this.handleEnded);
      this.audio.removeEventListener('error', this.handleError);
      this.audio.removeEventListener('loadstart', this.handleLoadStart);
      this.audio.removeEventListener('canplay', this.handleCanPlay);
      
      // Revoke object URL if it exists
      if (this.audio.src && this.audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audio.src);
      }
      
      this.audio = null;
    }
  }

  /**
   * Event handlers
   */
  handleEnded() {
    this.isPlaying = false;
    this.notifyStateChange('ended');
    this.notifyComplete();
    console.log('🏁 Audio playback completed');
  }

  handleError(event) {
    this.isPlaying = false;
    this.notifyStateChange('error');
    this.notifyError(event.error || new Error('Audio playback error'));
    console.error('❌ Audio error:', event.error);
  }

  handleLoadStart() {
    this.notifyStateChange('loading');
  }

  handleCanPlay() {
    this.notifyStateChange('ready');
  }

  /**
   * Event notification methods
   */
  notifyStateChange(state) {
    if (this.onStateChange) {
      this.onStateChange(state, this.getTimeInfo());
    }
  }

  notifyError(error) {
    if (this.onError) {
      this.onError(error);
    }
  }

  notifyComplete() {
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks({ onStateChange, onError, onComplete }) {
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.onComplete = onComplete;
  }

  /**
   * Destroy player and cleanup all resources
   */
  destroy() {
    this.stop();
    this.cleanup();
    this.onStateChange = null;
    this.onError = null;
    this.onComplete = null;
  }
}

/**
 * 🎵 Audio utility functions
 */
export const audioUtils = {
  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Check if browser supports audio format
   */
  supportsAudioFormat(format) {
    const audio = new Audio();
    const support = audio.canPlayType(format);
    return support === 'probably' || support === 'maybe';
  },

  /**
   * Get supported audio formats
   */
  getSupportedFormats() {
    const formats = [
      { type: 'audio/mpeg', name: 'MP3' },
      { type: 'audio/wav', name: 'WAV' },
      { type: 'audio/ogg', name: 'OGG' },
      { type: 'audio/webm', name: 'WebM' }
    ];
    
    return formats.filter(format => this.supportsAudioFormat(format.type));
  },

  /**
   * Download audio file
   */
  downloadAudio(audioBlob, filename = 'audio.mp3') {
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default AudioPlayer;
