import {Platform} from 'react-native';

/** UI locale only; never changes Quran or religious source text. */
export function isArabicInterface(): boolean {
  try {
    const locale = Platform.OS === 'web'
      ? (typeof navigator !== 'undefined' ? navigator.language : 'en')
      : Intl.DateTimeFormat().resolvedOptions().locale;
    return /^ar(?:[-_]|$)/i.test(locale);
  } catch {
    return false;
  }
}
