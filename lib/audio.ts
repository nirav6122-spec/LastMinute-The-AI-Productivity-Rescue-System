type SoundType = 'success' | 'warning' | 'urgent' | 'rescue' | 'default';

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  // Initialize the audio context (must be called after a user gesture ideally)
  public preload() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getVolume() {
    return this.volume;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public playNotificationSound(type: SoundType = 'default') {
    if (this.isMuted) return;
    this.preload();
    
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
    }

    try {
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      const now = this.audioCtx.currentTime;
      
      switch(type) {
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gainNode.gain.setValueAtTime(this.volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'warning':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.linearRampToValueAtTime(250, now + 0.2);
            gainNode.gain.setValueAtTime(this.volume, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'urgent':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.setValueAtTime(600, now + 0.1);
            oscillator.frequency.setValueAtTime(800, now + 0.2);
            gainNode.gain.setValueAtTime(this.volume * 0.6, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            break;
        case 'rescue':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
            gainNode.gain.setValueAtTime(this.volume, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);
            oscillator.start(now);
            oscillator.stop(now + 0.6);
            break;
        case 'default':
        default:
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
      }
    } catch (err) {
      console.error('Audio playback failed:', err);
    }
  }
}

export const audioManager = new AudioManager();

// Helper function for backwards compatibility
export function playNotificationSound(type: SoundType = 'default') {
  audioManager.playNotificationSound(type);
}
