import {I18nManager, Platform} from 'react-native';

/** True when the current layout direction is right-to-left (native or web). */
export function isRTL(): boolean {
  if (Platform.OS === 'web') {
    return (
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('dir') === 'rtl'
    );
  }
  return I18nManager.isRTL;
}

type Arrow = 'arrow-left' | 'arrow-right' | 'chevron-left' | 'chevron-right';

/** Mirror a directional Feather icon name under RTL (back arrow points right). */
export function dirIcon<T extends Arrow>(name: T): T {
  if (!isRTL()) return name;
  return (
    name.endsWith('-left')
      ? name.replace('-left', '-right')
      : name.replace('-right', '-left')
  ) as T;
}
