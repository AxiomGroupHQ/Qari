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

class IntroClipService {
  private player: AudioPlayer | null = null;
  private cancel: (() => void) | null = null;

  /** Stop a clip that is playing (user paused, skipped or left). */
  stop(): void {
    this.cancel?.();
  }

  isPlaying(): boolean {
    return this.player !== null;
  }

  /**
   * Play a clip and wait for it to finish. Never throws. Resolves true when it played to the end,
   * false when it was disabled, skipped or failed (callers carry on with the recitation either way).
   */
  async play(kind: ClipKind): Promise<boolean> {
    if (!isClipEnabled(kind)) return false;
    this.stop();
    let lang = 'en';
    try {
      lang = resolveLocale(useLanguageStore.getState().preference);
    } catch {
      /* English */
    }
    const url = clipUrlFor(lang);
    if (url && (await this.run(url))) return true;
    return this.run(BUNDLED_EN);
  }

  private run(source: string | number): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let done = false;
      let player: AudioPlayer | null = null;
      let loadTimer: ReturnType<typeof setTimeout> | undefined;
      let capTimer: ReturnType<typeof setTimeout> | undefined;
      let sub: {remove: () => void} | undefined;

      const finish = (ok: boolean) => {
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
        this.cancel = null;
        resolve(ok);
      };

      try {
        player = createAudioPlayer(
          typeof source === 'string' ? {uri: source} : source,
        );
        this.player = player;
        this.cancel = () => finish(false);
        let started = false;
        sub = player.addListener('playbackStatusUpdate', status => {
          if (status.isLoaded && !started) {
            started = true;
            clearTimeout(loadTimer);
          }
          if (status.didJustFinish) finish(true);
        });
        loadTimer = setTimeout(() => {
          if (!started) finish(false);
        }, LOAD_TIMEOUT_MS);
        capTimer = setTimeout(() => finish(started), MAX_CLIP_MS);
        player.play();
      } catch {
        finish(false);
      }
    });
  }
}

export const introClipService = new IntroClipService();
