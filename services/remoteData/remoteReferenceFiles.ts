/**
 * Reference JSON files the app downloads from iapi.istima.app/data/ at
 * startup (see RemoteDataService). Served byte-identical to the copies
 * that used to be bundled in the binary; the published versions live in
 * /data-manifest.json.
 *
 * Tafseer (11MB) is NOT here on purpose: it downloads lazily on first
 * tafseer open via loadBundledIbnKathir. reciters-fallback.json and
 * surahData stay bundled - they are the offline safety net for the
 * catalog and surah metadata and cost almost nothing.
 */
export const REMOTE_REFERENCE_FILES = [
  'quran.json',
  'clear-quran-translation.json',
  'SaheehInternational.translation-with-footnote-tags.json',
  'transliteration.json',
  'surahInfo.json',
  'quran-themes.json',
  'changelog.json',
] as const;
