/**
 * Intro/outro clip config. Everything comes from EXPO_PUBLIC_* environment variables (see
 * .env.example). Metro only inlines `process.env.EXPO_PUBLIC_X` when it is written out literally,
 * so do not refactor these into a loop.
 */
const flag = (v: string | undefined, fallback: boolean): boolean => {
  if (v === undefined || v === '') return fallback;
  return !['false', '0', 'off', 'no'].includes(v.trim().toLowerCase());
};

export const INTRO_CLIP_START_ENABLED = flag(
  process.env.EXPO_PUBLIC_INTRO_CLIP_START,
  true,
);
export const INTRO_CLIP_END_ENABLED = flag(
  process.env.EXPO_PUBLIC_INTRO_CLIP_END,
  true,
);
/** Where the localized clips live: <base>/<lang>.mp3. Blank = English only (bundled). */
export const INTRO_CLIP_BASE_URL = (
  process.env.EXPO_PUBLIC_INTRO_CLIP_BASE_URL ?? 'https://iapi.istima.app/clips'
).replace(/\/+$/, '');
/** The end clip only plays when the recitation is longer than this many seconds. */
export const INTRO_CLIP_END_MIN_SECONDS = (() => {
  const n = Number(process.env.EXPO_PUBLIC_INTRO_CLIP_END_MIN_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 180;
})();

/**
 * Languages that have a localized clip on the server. Any other language plays the bundled English
 * clip. Languages whose TTS voice is too weak stay out of this list until a native recording exists.
 */
export const INTRO_CLIP_LANGS: readonly string[] = [
  'ar',
  'ur',
  'id',
  'ms',
  'bn',
  'tr',
  'fa',
  'ps',
  'ha',
  'sw',
  'fr',
  'de',
  'es',
  'ru',
  'hi',
  'pa',
  'gu',
  'ta',
  'te',
  'ml',
  'kn',
  'mr',
  'si',
  'ne',
  'uz',
  'kk',
  'ky',
  'tk',
  'tg',
  'az',
  'sq',
  'bs',
  'mk',
  'sr',
  'so',
  'am',
  'yo',
  'ig',
  'prs',
  'zh',
  'th',
  'fil',
  'my',
  'km',
  'nl',
  'it',
  'pt',
  'ro',
  'el',
];
