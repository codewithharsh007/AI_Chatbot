// Text-to-Speech Utility using Web Speech API
export class TextToSpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
  }

  // Initialize and load available voices
  async initialize() {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return false;
    }

    return new Promise((resolve) => {
      // Load voices
      const loadVoices = () => {
        this.voices = this.synth.getVoices();
        this.isInitialized = true;
        resolve(true);
      };

      // Chrome loads voices asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }

      // Try to load voices immediately (works in Firefox)
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        this.isInitialized = true;
        resolve(true);
      }
    });
  }

  // Get available voices
  getAvailableVoices() {
    if (!this.isInitialized) return [];
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
    }));
  }

  // Speak text with options
  speak(text, options = {}) {
    if (!this.synth || !this.isInitialized) {
      console.warn('TTS not initialized');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    if (options.voiceName) {
      const voice = this.voices.find(v => v.name === options.voiceName);
      if (voice) utterance.voice = voice;
    }

    // Set properties
    utterance.rate = options.speed || 1.0; // 0.5 to 2.0
    utterance.pitch = options.pitch || 1.0; // 0 to 2
    utterance.volume = options.volume || 1.0; // 0 to 1

    // Event handlers
    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (error) => {
      console.error('TTS Error:', error);
      this.currentUtterance = null;
      if (options.onError) options.onError(error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  // Pause speech
  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  // Resume speech
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  // Stop speech
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  // Check if paused
  isPaused() {
    return this.synth ? this.synth.paused : false;
  }
}

// Create singleton instance
let ttsServiceInstance = null;

export function getTTSService() {
  if (typeof window === 'undefined') return null;
  
  if (!ttsServiceInstance) {
    ttsServiceInstance = new TextToSpeechService();
  }
  return ttsServiceInstance;
}

// Utility function to clean text for better TTS
export function cleanTextForTTS(text) {
  return text
    .replace(/```[\s\S]*?```/g, 'code block') // Replace code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/>\s/g, '') // Remove blockquotes
    .replace(/[-*+]\s/g, '') // Remove list markers
    .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period
    .replace(/\n/g, ' ') // Replace single newlines with space
    .trim();
}
