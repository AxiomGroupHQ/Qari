import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager, Platform} from 'react-native';
import * as Localization from 'expo-localization';
import {localeLoaders} from '@/locales';
import {
  DEFAULT_LOCALE,
  getLocaleInfo,
  isRtlLocale,
  matchDeviceLocale,
} from '@/i18n/locales';
import {useLanguageStore} from '@/store/languageStore';

/** Resolve the effective locale from a stored preference + device settings. */
export function resolveLocale(preference: string): string {
  if (preference !== 'system' && localeLoaders[preference]) return preference;
  try {
    for (const l of Localization.getLocales()) {
      const m = matchDeviceLocale(l.languageTag);
      if (m && localeLoaders[m]) return m;
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_LOCALE;
}

function loadBundle(code: string): Record<string, unknown> {
  const loader = localeLoaders[code] ?? localeLoaders[DEFAULT_LOCALE];
  const mod = loader() as {default?: Record<string, unknown>};
  return (mod.default ?? mod) as Record<string, unknown>;
}

/** Applies document direction/lang on web; native direction needs a reload. */
function applyDirection(code: string): boolean {
  const rtl = isRtlLocale(code);
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute(
        'lang',
        getLocaleInfo(code).intlTag,
      );
    }
    I18nManager.allowRTL(true);
    return false;
  }
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true; // native layout direction changes after the next reload
  }
  return false;
}

let initialized = false;

/** Initialise i18next. Call once before first render (after store rehydrate). */
export async function initI18n(): Promise<{
  locale: string;
  needsReload: boolean;
}> {
  await useLanguageStore.persist.rehydrate?.();
  const locale = resolveLocale(useLanguageStore.getState().preference);
  const needsReload = applyDirection(locale);
  const resources: Record<string, {translation: Record<string, unknown>}> = {
    [DEFAULT_LOCALE]: {translation: loadBundle(DEFAULT_LOCALE)},
  };
  if (locale !== DEFAULT_LOCALE)
    resources[locale] = {translation: loadBundle(locale)};
  if (!initialized) {
    await i18next.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      interpolation: {escapeValue: false},
      returnNull: false,
      compatibilityJSON: 'v4',
      react: {useSuspense: false},
    });
    initialized = true;
  } else {
    await changeLocale(locale);
  }
  return {locale, needsReload};
}

/** Switch language at runtime. Returns whether a reload is needed for RTL flip. */
export async function changeLocale(code: string): Promise<boolean> {
  if (!i18next.hasResourceBundle(code, 'translation')) {
    i18next.addResourceBundle(
      code,
      'translation',
      loadBundle(code),
      true,
      true,
    );
  }
  await i18next.changeLanguage(code);
  return applyDirection(code);
}

/** Set the user's language preference ("system" or a code) and apply it. */
export async function setLanguagePreference(
  preference: string,
): Promise<boolean> {
  useLanguageStore.getState().setPreference(preference);
  const code = resolveLocale(preference);
  return changeLocale(code);
}

export default i18next;

/** Global translate function for non-hook contexts (functions, callbacks, alerts). */
export const t = (key: string, options?: Record<string, unknown>): string =>
  i18next.t(key, options) as string;
