/**
 * Supported interface locales. UI chrome only: Quran text, translations,
 * tafsir, duas, adhkar text and transliterations are never localized here.
 */
export interface LocaleInfo {
  /** Locale code used for resource files, e.g. "ar", "ckb". */
  code: string;
  englishName: string;
  nativeName: string;
  rtl: boolean;
  /** BCP 47 tag used for Intl formatting (number, date, plural). */
  intlTag: string;
  /** Ordered fallbacks for Intl when the runtime lacks data for intlTag. */
  intlFallbacks?: string[];
  /** Quality tier: machine translations flagged for native review. */
  reviewRecommended?: boolean;
}

export const LOCALES: readonly LocaleInfo[] = [
  {
    code: 'en',
    englishName: 'English',
    nativeName: 'English',
    rtl: false,
    intlTag: 'en',
  },
  {
    code: 'ar',
    englishName: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    intlTag: 'ar',
  },
  {
    code: 'ur',
    englishName: 'Urdu',
    nativeName: 'اردو',
    rtl: true,
    intlTag: 'ur',
  },
  {
    code: 'id',
    englishName: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    rtl: false,
    intlTag: 'id',
  },
  {
    code: 'ms',
    englishName: 'Malay',
    nativeName: 'Bahasa Melayu',
    rtl: false,
    intlTag: 'ms',
  },
  {
    code: 'bn',
    englishName: 'Bengali',
    nativeName: 'বাংলা',
    rtl: false,
    intlTag: 'bn',
  },
  {
    code: 'tr',
    englishName: 'Turkish',
    nativeName: 'Türkçe',
    rtl: false,
    intlTag: 'tr',
  },
  {
    code: 'fa',
    englishName: 'Persian',
    nativeName: 'فارسی',
    rtl: true,
    intlTag: 'fa',
  },
  {
    code: 'ps',
    englishName: 'Pashto',
    nativeName: 'پښتو',
    rtl: true,
    intlTag: 'ps',
    intlFallbacks: ['fa'],
  },
  {
    code: 'ha',
    englishName: 'Hausa',
    nativeName: 'Hausa',
    rtl: false,
    intlTag: 'ha',
  },
  {
    code: 'sw',
    englishName: 'Swahili',
    nativeName: 'Kiswahili',
    rtl: false,
    intlTag: 'sw',
  },
  {
    code: 'fr',
    englishName: 'French',
    nativeName: 'Français',
    rtl: false,
    intlTag: 'fr',
  },
  {
    code: 'de',
    englishName: 'German',
    nativeName: 'Deutsch',
    rtl: false,
    intlTag: 'de',
  },
  {
    code: 'es',
    englishName: 'Spanish',
    nativeName: 'Español',
    rtl: false,
    intlTag: 'es',
  },
  {
    code: 'ru',
    englishName: 'Russian',
    nativeName: 'Русский',
    rtl: false,
    intlTag: 'ru',
  },
  {
    code: 'hi',
    englishName: 'Hindi',
    nativeName: 'हिन्दी',
    rtl: false,
    intlTag: 'hi',
  },
  {
    code: 'pa',
    englishName: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    rtl: false,
    intlTag: 'pa',
  },
  {
    code: 'gu',
    englishName: 'Gujarati',
    nativeName: 'ગુજરાતી',
    rtl: false,
    intlTag: 'gu',
  },
  {
    code: 'ta',
    englishName: 'Tamil',
    nativeName: 'தமிழ்',
    rtl: false,
    intlTag: 'ta',
  },
  {
    code: 'te',
    englishName: 'Telugu',
    nativeName: 'తెలుగు',
    rtl: false,
    intlTag: 'te',
  },
  {
    code: 'ml',
    englishName: 'Malayalam',
    nativeName: 'മലയാളം',
    rtl: false,
    intlTag: 'ml',
  },
  {
    code: 'kn',
    englishName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    rtl: false,
    intlTag: 'kn',
  },
  {
    code: 'mr',
    englishName: 'Marathi',
    nativeName: 'मराठी',
    rtl: false,
    intlTag: 'mr',
  },
  {
    code: 'as',
    englishName: 'Assamese',
    nativeName: 'অসমীয়া',
    rtl: false,
    intlTag: 'as',
    intlFallbacks: ['bn'],
    reviewRecommended: true,
  },
  {
    code: 'si',
    englishName: 'Sinhala',
    nativeName: 'සිංහල',
    rtl: false,
    intlTag: 'si',
  },
  {
    code: 'ne',
    englishName: 'Nepali',
    nativeName: 'नेपाली',
    rtl: false,
    intlTag: 'ne',
  },
  {
    code: 'uz',
    englishName: 'Uzbek',
    nativeName: 'Oʻzbekcha',
    rtl: false,
    intlTag: 'uz',
  },
  {
    code: 'kk',
    englishName: 'Kazakh',
    nativeName: 'Қазақша',
    rtl: false,
    intlTag: 'kk',
  },
  {
    code: 'ky',
    englishName: 'Kyrgyz',
    nativeName: 'Кыргызча',
    rtl: false,
    intlTag: 'ky',
  },
  {
    code: 'tk',
    englishName: 'Turkmen',
    nativeName: 'Türkmençe',
    rtl: false,
    intlTag: 'tk',
  },
  {
    code: 'tg',
    englishName: 'Tajik',
    nativeName: 'Тоҷикӣ',
    rtl: false,
    intlTag: 'tg',
    intlFallbacks: ['ru'],
  },
  {
    code: 'az',
    englishName: 'Azerbaijani',
    nativeName: 'Azərbaycanca',
    rtl: false,
    intlTag: 'az',
  },
  {
    code: 'sq',
    englishName: 'Albanian',
    nativeName: 'Shqip',
    rtl: false,
    intlTag: 'sq',
  },
  {
    code: 'bs',
    englishName: 'Bosnian',
    nativeName: 'Bosanski',
    rtl: false,
    intlTag: 'bs',
  },
  {
    code: 'mk',
    englishName: 'Macedonian',
    nativeName: 'Македонски',
    rtl: false,
    intlTag: 'mk',
  },
  {
    code: 'sr',
    englishName: 'Serbian',
    nativeName: 'Српски',
    rtl: false,
    intlTag: 'sr',
  },
  {
    code: 'so',
    englishName: 'Somali',
    nativeName: 'Soomaali',
    rtl: false,
    intlTag: 'so',
  },
  {
    code: 'om',
    englishName: 'Oromo',
    nativeName: 'Afaan Oromoo',
    rtl: false,
    intlTag: 'om',
    intlFallbacks: ['en'],
    reviewRecommended: true,
  },
  {
    code: 'am',
    englishName: 'Amharic',
    nativeName: 'አማርኛ',
    rtl: false,
    intlTag: 'am',
  },
  {
    code: 'ti',
    englishName: 'Tigrinya',
    nativeName: 'ትግርኛ',
    rtl: false,
    intlTag: 'ti',
    intlFallbacks: ['am'],
    reviewRecommended: true,
  },
  {
    code: 'ff',
    englishName: 'Fula',
    nativeName: 'Pulaar',
    rtl: false,
    intlTag: 'ff',
    intlFallbacks: ['fr'],
    reviewRecommended: true,
  },
  {
    code: 'wo',
    englishName: 'Wolof',
    nativeName: 'Wolof',
    rtl: false,
    intlTag: 'wo',
    intlFallbacks: ['fr'],
    reviewRecommended: true,
  },
  {
    code: 'mnk',
    englishName: 'Mandinka',
    nativeName: 'Mandinka',
    rtl: false,
    intlTag: 'mnk',
    intlFallbacks: ['fr', 'en'],
    reviewRecommended: true,
  },
  {
    code: 'bm',
    englishName: 'Bambara',
    nativeName: 'Bamanankan',
    rtl: false,
    intlTag: 'bm',
    intlFallbacks: ['fr'],
    reviewRecommended: true,
  },
  {
    code: 'yo',
    englishName: 'Yoruba',
    nativeName: 'Yorùbá',
    rtl: false,
    intlTag: 'yo',
  },
  {
    code: 'ig',
    englishName: 'Igbo',
    nativeName: 'Igbo',
    rtl: false,
    intlTag: 'ig',
  },
  {
    code: 'prs',
    englishName: 'Dari',
    nativeName: 'دری',
    rtl: true,
    intlTag: 'fa-AF',
    intlFallbacks: ['fa'],
    reviewRecommended: true,
  },
  {
    code: 'kmr',
    englishName: 'Kurdish (Kurmanji)',
    nativeName: 'Kurdî (Kurmancî)',
    rtl: false,
    intlTag: 'ku',
    intlFallbacks: ['tr'],
    reviewRecommended: true,
  },
  {
    code: 'ckb',
    englishName: 'Kurdish (Sorani)',
    nativeName: 'کوردیی ناوەندی',
    rtl: true,
    intlTag: 'ckb',
    intlFallbacks: ['ar'],
    reviewRecommended: true,
  },
  {
    code: 'ug',
    englishName: 'Uyghur',
    nativeName: 'ئۇيغۇرچە',
    rtl: true,
    intlTag: 'ug',
    intlFallbacks: ['ar'],
    reviewRecommended: true,
  },
  {
    code: 'zh',
    englishName: 'Chinese (Simplified)',
    nativeName: '简体中文',
    rtl: false,
    intlTag: 'zh-Hans',
  },
  {
    code: 'th',
    englishName: 'Thai',
    nativeName: 'ไทย',
    rtl: false,
    intlTag: 'th',
  },
  {
    code: 'fil',
    englishName: 'Filipino',
    nativeName: 'Filipino',
    rtl: false,
    intlTag: 'fil',
  },
  {
    code: 'my',
    englishName: 'Burmese',
    nativeName: 'မြန်မာ',
    rtl: false,
    intlTag: 'my',
  },
  {
    code: 'km',
    englishName: 'Khmer',
    nativeName: 'ខ្មែរ',
    rtl: false,
    intlTag: 'km',
  },
  {
    code: 'nl',
    englishName: 'Dutch',
    nativeName: 'Nederlands',
    rtl: false,
    intlTag: 'nl',
  },
  {
    code: 'it',
    englishName: 'Italian',
    nativeName: 'Italiano',
    rtl: false,
    intlTag: 'it',
  },
  {
    code: 'pt',
    englishName: 'Portuguese',
    nativeName: 'Português',
    rtl: false,
    intlTag: 'pt',
  },
  {
    code: 'ro',
    englishName: 'Romanian',
    nativeName: 'Română',
    rtl: false,
    intlTag: 'ro',
  },
  {
    code: 'el',
    englishName: 'Greek',
    nativeName: 'Ελληνικά',
    rtl: false,
    intlTag: 'el',
  },
];

export const DEFAULT_LOCALE = 'en';
export const LOCALE_CODES = LOCALES.map(l => l.code);
const BY_CODE = new Map(LOCALES.map(l => [l.code, l]));

export const getLocaleInfo = (code: string): LocaleInfo =>
  BY_CODE.get(code) ?? (BY_CODE.get(DEFAULT_LOCALE) as LocaleInfo);

export const isRtlLocale = (code: string): boolean => getLocaleInfo(code).rtl;

/**
 * Map a device locale tag (e.g. "ar-SA", "zh-Hans-CN", "fa-AF", "ku-TR",
 * "tl-PH", "nb") to a supported locale code, or null if unsupported.
 */
export function matchDeviceLocale(
  tag: string | undefined | null,
): string | null {
  if (!tag) return null;
  const t = tag.replace(/_/g, '-').toLowerCase();
  const parts = t.split('-');
  const lang = parts[0];
  const region = parts.find((p, i) => i > 0 && /^[a-z]{2}$/.test(p));
  if (lang === 'fa' && region === 'af') return 'prs';
  if (lang === 'ku')
    return parts.includes('arab') || region === 'iq' || region === 'ir'
      ? 'ckb'
      : 'kmr';
  if (lang === 'tl') return 'fil';
  if (lang === 'in') return 'id';
  if (lang === 'iw') return null;
  if (lang === 'zh')
    return parts.includes('hant') || region === 'tw' || region === 'hk'
      ? null
      : 'zh';
  if (lang === 'no' || lang === 'nb' || lang === 'nn') return null;
  return BY_CODE.has(lang) ? lang : null;
}
