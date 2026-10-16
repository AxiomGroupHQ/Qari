/**
 * Intro/outro clip ("You are listening in Istima app by Halalweb.").
 *
 * Plays on its own short-lived player, before a surah starts and after it ends. It never touches the
 * recitation file or the recitation player, so word-highlight timing is unaffected, and it never
 * runs between ayat. Works the same on web, iOS and Android (expo-audio).
 *
 * Clip source: <EXPO_PUBLIC_INTRO_CLIP_BASE_URL>/<lang>.mp3 for languages in INTRO_CLIP_LANGS, with
 * the bundled English clip as the fallback for every other language and for any load/playback error.
 */
import {getActiveClip, setActiveClip, whenClipIdle} from './clipGate';
import {createAudioPlayer, type AudioPlayer} from 'expo-audio';
import {
  INTRO_CLIP_BASE_URL,
  INTRO_CLIP_END_ENABLED,
  INTRO_CLIP_END_MIN_SECONDS,
  INTRO_CLIP_LANGS,
  INTRO_CLIP_START_ENABLED,
} from '@/config/introClip';
import {resolveLocale} from '@/i18n';
import {useLanguageStore} from '@/store/languageStore';

export type ClipKind = 'start' | 'end';

const BUNDLED_EN = require('@/assets/audio/intro/en.mp3');

/** Hard cap so a stuck load can never hold up the recitation. */
const MAX_CLIP_MS = 12000;
const LOAD_TIMEOUT_MS = 4000;

export function isClipEnabled(kind: ClipKind): boolean {
  return kind === 'start' ? INTRO_CLIP_START_ENABLED : INTRO_CLIP_END_ENABLED;
}

/** End clip only for surahs longer than the threshold (default 3 min). */
export function shouldPlayEndClip(durationSeconds: number): boolean {
  return (
    INTRO_CLIP_END_ENABLED &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > INTRO_CLIP_END_MIN_SECONDS
  );
}

/** Remote URL for a language, or null when that language falls back to the bundled English clip. */
export function clipUrlFor(lang: string): string | null {
  if (!INTRO_CLIP_BASE_URL || !INTRO_CLIP_LANGS.includes(lang)) return null;
  return `${INTRO_CLIP_BASE_URL}/${lang}.mp3`;
}

/** completed: played to the end. failed: could not play (carry on). cancelled: stopped on purpose. */
export type ClipResult = 'completed' | 'failed' | 'cancelled' | 'disabled';

class IntroClipService {
  private player: AudioPlayer | null = null;
  private cancel: (() => void) | null = null;
  /** Bumped by every stop(). A clip job started before the bump must not start another player. */
  private epoch = 0;

  /** Stop a clip that is playing (user paused, skipped or started another track). */
  stop(): void {
    this.epoch += 1;
    this.cancel?.();
  }

  /**
   * Resolves once no clip is running. The recitation player waits on this before it plays, so the
   * recitation can never start underneath a clip, whichever code path asks it to play.
   */
  async whenIdle(): Promise<void> {
    await whenClipIdle();
  }

  isPlaying(): boolean {
    return this.player !== null;
  }

  /**
   * Play a clip and wait for it to finish. Never throws. Callers must only start the recitation
   * when the result is not 'cancelled'.
   */
  async play(kind: ClipKind): Promise<ClipResult> {
    if (!isClipEnabled(kind)) return 'disabled';
    this.stop();
    const job = this.playInner(this.epoch);
    setActiveClip(job);
    try {
      return await job;
    } finally {
      if (getActiveClip() === job) setActiveClip(null);
    }
  }

  private async playInner(epoch: number): Promise<ClipResult> {
    let lang = 'en';
    try {
      lang = resolveLocale(useLanguageStore.getState().preference);
    } catch {
      /* English */
    }
    const url = clipUrlFor(lang);
    if (url) {
      const r = await this.run(url, epoch);
      if (r !== 'failed') return r;
    }
    // stop() can land between the remote attempt and the fallback, when no player exists to cancel.
    if (this.epoch !== epoch) return 'cancelled';
    return this.run(BUNDLED_EN, epoch);
  }

  private run(source: string | number, epoch: number): Promise<ClipResult> {
    return new Promise<ClipResult>(resolve => {
      if (this.epoch !== epoch) {
        resolve('cancelled');
        return;
      }
      let done = false;
      let player: AudioPlayer | null = null;
      let loadTimer: ReturnType<typeof setTimeout> | undefined;
      let capTimer: ReturnType<typeof setTimeout> | undefined;
      let sub: {remove: () => void} | undefined;

      const cancelThis = () => finish('cancelled');
      const finish = (result: ClipResult) => {
        if (done) return;
        done = true;
        clearTimeout(loadTimer);
        clearTimeout(capTimer);
        try {
          sub?.remove();
          player?.pause();
          player?.remove();
        } catch {
          /* already released */
        }
        if (this.player === player) this.player = null;
        if (this.cancel === cancelThis) this.cancel = null;
        resolve(result);
      };

      try {
        player = createAudioPlayer(
          typeof source === 'string' ? {uri: source} : source,
        );
        this.player = player;
        this.cancel = cancelThis;
        let started = false;
        sub = player.addListener('playbackStatusUpdate', status => {
          if (status.isLoaded && !started) {
            started = true;
            clearTimeout(loadTimer);
          }
          if (status.didJustFinish) finish('completed');
        });
        loadTimer = setTimeout(() => {
          if (!started) finish('failed');
        }, LOAD_TIMEOUT_MS);
        capTimer = setTimeout(
          () => finish(started ? 'completed' : 'failed'),
          MAX_CLIP_MS,
        );
        player.play();
      } catch {
        finish('failed');
      }
    });
  }
}

export const introClipService = new IntroClipService();
