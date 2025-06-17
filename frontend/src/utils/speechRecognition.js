// 🎤 Simple, Working Speech Recognition - No Feedback Issues
// Reliable speech recognition for demo purposes

class VoiceChatRecognition {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    
    // Callbacks
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    this.onStateChange = null;
    
    this.initializeRecognition();
  }

  /**
   * Initialize speech recognition
   */
  initializeRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    
    // Simple, reliable configuration
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    
    this.setupEventListeners();
    console.log('✅ Speech Recognition initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Listening started');
      if (this.onStart) this.onStart();
      if (this.onStateChange) this.onStateChange('listening');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🔇 Listening ended');
      if (this.onEnd) this.onEnd();
      if (this.onStateChange) this.onStateChange('idle');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          finalTranscript: finalTranscript.trim(),
          interimTranscript: interimTranscript.trim(),
          isFinal: finalTranscript.length > 0
        });
      }

      // Auto-stop after getting final result
      if (finalTranscript.trim().length > 0) {
        setTimeout(() => this.stopListening(), 100);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError({
          error: event.error,
          message: this.getErrorMessage(event.error)
        });
      }
      
      if (this.onStateChange) this.onStateChange('error');
    };
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.isSupported) {
      const error = { error: 'not-supported', message: 'Speech recognition not supported' };
      if (this.onError) this.onError(error);
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      if (this.onError) {
        this.onError({ error: 'start-failed', message: 'Failed to start recognition' });
      }
      return false;
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }

  /**
   * Toggle listening
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Set callbacks
   */
  setCallbacks({ onResult, onError, onStart, onEnd, onStateChange }) {
    this.onResult = onResult;
    this.onError = onError; 
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onStateChange = onStateChange;
  }

  /**
   * Get error message
   */
  getErrorMessage(error) {
    const messages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone access denied.',
      'not-allowed': 'Please allow microphone access.',
      'network': 'Network error. Check your connection.',
      'aborted': 'Speech recognition stopped.',
      'service-not-allowed': 'Speech service not allowed.'
    };
    return messages[error] || `Speech error: ${error}`;
  }

  /**
   * Check browser support
   */
  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Request microphone permission
   */
  static async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.recognition) {
      this.stopListening();
      this.recognition = null;
    }
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    this.onStateChange = null;
  }
}

export default VoiceChatRecognition;