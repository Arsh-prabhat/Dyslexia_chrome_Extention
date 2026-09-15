import { ReadingSpeed } from '../shared/types';
import { FocusModeManager, ReadingUnit } from './focus-mode';

export class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private focusManager: FocusModeManager;
  private readingSpeed: ReadingSpeed = 1;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private onStateChangeCallback?: (state: { isReading: boolean; isPaused: boolean; currentIndex: number }) => void;

  constructor(focusManager: FocusModeManager) {
    this.focusManager = focusManager;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    } else {
      console.warn('[DyslexiaReader] Web Speech API is not supported in this browser environment.');
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null;
  }

  public setOnStateChange(cb: (state: { isReading: boolean; isPaused: boolean; currentIndex: number }) => void): void {
    this.onStateChangeCallback = cb;
  }

  public setSpeed(speed: ReadingSpeed): void {
    this.readingSpeed = speed;
    if (this.isSpeaking && this.currentUtterance && this.synth) {
      // Re-speak current unit with new rate
      const currentUnit = this.focusManager.getCurrentUnit();
      if (currentUnit) {
        this.speakCurrentUnit();
      }
    }
  }

  public startReading(): void {
    if (!this.isAvailable()) return;

    if (this.isPaused && this.synth) {
      this.synth.resume();
      this.isPaused = false;
      this.isSpeaking = true;
      this.notifyStateChange();
      return;
    }

    if (!this.focusManager.getIsActive()) {
      this.focusManager.enable('sentence');
    }

    const currentIndex = this.focusManager.getCurrentIndex();
    if (currentIndex < 0) {
      this.focusManager.highlightIndex(0);
    }

    this.speakCurrentUnit();
  }

  public pauseReading(): void {
    if (!this.isAvailable() || !this.synth) return;

    if (this.isSpeaking) {
      this.synth.pause();
      this.isPaused = true;
      this.isSpeaking = false;
      this.notifyStateChange();
    }
  }

  public stopReading(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notifyStateChange();
  }

  public nextUnit(): void {
    this.stopSynthOnly();
    const next = this.focusManager.nextUnit();
    if (next && (this.isSpeaking || this.isPaused)) {
      this.speakCurrentUnit();
    } else {
      this.notifyStateChange();
    }
  }

  public previousUnit(): void {
    this.stopSynthOnly();
    const prev = this.focusManager.previousUnit();
    if (prev && (this.isSpeaking || this.isPaused)) {
      this.speakCurrentUnit();
    } else {
      this.notifyStateChange();
    }
  }

  private speakCurrentUnit(): void {
    if (!this.synth) return;

    const unit = this.focusManager.getCurrentUnit();
    if (!unit) {
      this.stopReading();
      return;
    }

    this.stopSynthOnly();

    const utterance = new SpeechSynthesisUtterance(unit.text);
    utterance.rate = this.readingSpeed;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyStateChange();
    };

    utterance.onend = () => {
      // Automatically advance to next unit when current utterance completes
      if (this.isSpeaking) {
        const next = this.focusManager.nextUnit();
        if (next) {
          this.speakCurrentUnit();
        } else {
          this.stopReading();
        }
      }
    };

    utterance.onerror = (event) => {
      console.error('[DyslexiaReader] Speech synthesis utterance error:', event);
      this.stopReading();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  private stopSynthOnly(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isReading: this.isSpeaking,
        isPaused: this.isPaused,
        currentIndex: this.focusManager.getCurrentIndex()
      });
    }
  }
}
