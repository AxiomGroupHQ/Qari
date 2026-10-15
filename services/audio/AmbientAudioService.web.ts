// @ai-generated
/**
 * Web ambient audio via the Web Audio API.
 *
 * iOS browsers ignore HTMLMediaElement.volume (always 1), so the slider did
 * nothing and sounds were loud. A GainNode works everywhere.
 */
import {Asset} from 'expo-asset';
import {
  AmbientSoundType,
  AMBIENT_SOUNDS,
  AMBIENT_FADE_DURATION,
  DEFAULT_AMBIENT_VOLUME,
} from '@/types/ambient';

/** Perceptual curve + ceiling so mid-slider values are comfortably quiet. */
const toGain = (volume: number) => Math.pow(volume, 1.5) * 0.5;

class AmbientAudioService {
  private static instance: AmbientAudioService;

  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private currentSound: AmbientSoundType | null = null;
  private targetVolume: number = DEFAULT_AMBIENT_VOLUME;
  private isPlaying = false;
  private loadToken = 0;
  private wantPlay = false;

  static getInstance(): AmbientAudioService {
    if (!AmbientAudioService.instance) {
      AmbientAudioService.instance = new AmbientAudioService();
    }
    return AmbientAudioService.instance;
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as {webkitAudioContext?: typeof AudioContext})
        .webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.ctx.destination);
    return this.ctx;
  }

  loadSound(soundType: AmbientSoundType): void {
    const meta = AMBIENT_SOUNDS[soundType];
    if (!meta) return;
    this.stopSource();
    this.buffer = null;
    this.currentSound = soundType;
    const token = ++this.loadToken;
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Browsers only allow audio after a user gesture; loadSound runs from a tap.
    ctx.resume().catch(() => undefined);

    (async () => {
      try {
        const asset = Asset.fromModule(meta.source);
        const res = await fetch(asset.uri);
        const data = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(data);
        if (token !== this.loadToken) return;
        this.buffer = buffer;
        if (this.wantPlay) this.startSource();
      } catch (error) {
        console.error('[AmbientAudio] Failed to load sound:', error);
      }
    })();
  }

  private startSource(): void {
    if (!this.ctx || !this.gain || !this.buffer || this.source) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = true;
    src.connect(this.gain);
    src.start();
    this.source = src;
  }

  private stopSource(): void {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // ignore
      }
      this.source.disconnect();
      this.source = null;
    }
  }

  private rampTo(gain: number, seconds: number): void {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(gain, now + seconds);
  }

  play(): void {
    this.wantPlay = true;
    this.ctx?.resume().catch(() => undefined);
    this.startSource();
    this.isPlaying = true;
  }

  pause(): void {
    this.wantPlay = false;
    this.isPlaying = false;
    this.stopSource();
  }

  stop(): void {
    this.loadToken++;
    this.wantPlay = false;
    this.isPlaying = false;
    this.stopSource();
    this.buffer = null;
    this.currentSound = null;
    if (this.gain && this.ctx) {
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.value = 0;
    }
  }

  setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.gain && this.isPlaying) {
      this.rampTo(toGain(this.targetVolume), 0.05);
    }
  }

  getVolume(): number {
    return this.targetVolume;
  }

  fadeIn(): void {
    if (!this.gain) this.ensureContext();
    if (this.gain) this.gain.gain.value = 0;
    this.play();
    this.rampTo(toGain(this.targetVolume), AMBIENT_FADE_DURATION / 1000);
  }

  fadeOut(): void {
    if (!this.isPlaying) return;
    this.rampTo(0, AMBIENT_FADE_DURATION / 1000);
    const token = this.loadToken;
    setTimeout(() => {
      if (token === this.loadToken) this.pause();
    }, AMBIENT_FADE_DURATION);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentSound(): AmbientSoundType | null {
    return this.currentSound;
  }

  hasPlayer(): boolean {
    return this.currentSound !== null;
  }

  cleanup(): void {
    this.stop();
    this.targetVolume = DEFAULT_AMBIENT_VOLUME;
  }
}

export const ambientAudioService = AmbientAudioService.getInstance();
export {AmbientAudioService};
