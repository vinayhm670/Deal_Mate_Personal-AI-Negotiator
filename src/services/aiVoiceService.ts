// AI Voice Text-to-Speech (TTS) Service using Web Speech API

class AIVoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public enabled: boolean = true;
  public isSpeaking: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      try {
        const saved = localStorage.getItem('dealmate_ai_voice_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        // ignore
      }

      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer high-quality, friendly natural English voices
    const preferred = voices.find(
      (v) =>
        (v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en-GB')) &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('David') ||
          v.name.includes('Jenny'))
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    this.selectedVoice = preferred || null;
  }

  public subscribe(listener: (speaking: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    try {
      localStorage.setItem('dealmate_ai_voice_enabled', String(this.enabled));
    } catch {
      // ignore
    }
    return this.enabled;
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.notify(false);
  }

  // Clean raw markdown and emojis for fluent speech
  private sanitizeForSpeech(rawText: string): string {
    return rawText
      .replace(/https?:\/\/\S+/g, '') // remove URLs
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
      .replace(/[*_#`~>[\]]/g, ' ') // remove markdown syntax
      .replace(/₹(\d+)/g, '$1 rupees') // read currency naturally
      .replace(/INR\s*(\d+)/gi, '$1 rupees')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (!this.enabled || !this.synth) return;

    this.stop(); // Stop any active speech

    const cleanText = this.sanitizeForSpeech(text);
    if (!cleanText) return;

    // Limit length for crisp conversational voice replies
    const trimmed = cleanText.length > 320 ? cleanText.slice(0, 320) + '...' : cleanText;

    try {
      const utterance = new SpeechSynthesisUtterance(trimmed);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = options?.rate || 1.05; // Slightly conversational brisk pace
      utterance.pitch = options?.pitch || 1.0;

      utterance.onstart = () => {
        this.notify(true);
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.notify(false);
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        this.notify(false);
        options?.onEnd?.();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.notify(false);
    }
  }
}

export const aiVoice = new AIVoiceService();

