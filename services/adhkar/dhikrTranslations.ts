import type {Dhikr} from '@/types/adhkar';

/**
 * Per-language translations of dhikr body text (translation / instruction).
 *
 * Human translations are preferred and are added only after the team has
 * confirmed the source and its license. Languages with no approved human
 * source may ship a machine-translated bundle, always flagged unreviewed
 * in data/adhkar-translations/<locale>.meta.json; the UI keeps English
 * fallback for any missing id or field. Quran, tafsir and Arabic text are
 * never machine-translated. Bundle files live in
 * data/adhkar-translations/<locale>.json as sparse maps from dhikr id to
 * the translated fields:
 *
 *   { "75": { "translation": "...", "instruction": "..." } }
 *
 * Missing locales, missing ids, and missing fields all fall back to the
 * English text seeded into the adhkar SQLite table, so a partial bundle is
 * always safe to ship.
 *
 * Istima serves its bundles from https://iapi.istima.app/adhkar/ (see
 * dhikrTranslationLoader.ts); a fork can still ship bundles in the binary
 * by registering loaders here.
 */
export interface DhikrTranslationEntry {
  translation?: string;
  instruction?: string;
}

export type DhikrTranslationBundle = Record<string, DhikrTranslationEntry>;

type BundleLoader = () =>
  | DhikrTranslationBundle
  | {default: DhikrTranslationBundle};

/**
 * Registry of bundles shipped inside the binary. Empty for Istima - its
 * bundles download from the API host - but kept so forks can ship a
 * bundle without any network piece.
 */
const bundleLoaders: Record<string, BundleLoader> = {};

/**
 * Bundles downloaded this session by dhikrTranslationLoader, keyed by
 * base locale. Preferred over the shipped registry.
 */
const downloadedBundles: Record<string, DhikrTranslationBundle> = {};

const bundleCache: Record<string, DhikrTranslationBundle | null> = {};

/**
 * Publish a downloaded bundle for synchronous reads. Called by
 * dhikrTranslationLoader (and tests); not part of a fork's setup.
 */
export function setDownloadedDhikrTranslationBundle(
  locale: string,
  bundle: DhikrTranslationBundle,
): void {
  downloadedBundles[locale] = bundle;
  delete bundleCache[locale];
}

/** Register a bundle loader (used by the generated index and tests). */
export function registerDhikrTranslationBundle(
  locale: string,
  loader: BundleLoader,
): void {
  bundleLoaders[locale] = loader;
  delete bundleCache[locale];
}

/** Load the bundle for a locale, or null when none is available. Cached. */
export function getDhikrTranslationBundle(
  locale: string,
): DhikrTranslationBundle | null {
  // Fall back to the base language for regional locales (nl-BE -> nl).
  const key =
    locale in downloadedBundles || locale in bundleLoaders
      ? locale
      : (locale.split('-')[0] ?? locale);
  if (key in downloadedBundles) return downloadedBundles[key];
  if (key in bundleCache) return bundleCache[key];
  const loader = bundleLoaders[key];
  if (!loader) {
    bundleCache[key] = null;
    return null;
  }
  try {
    const mod = loader();
    bundleCache[key] =
      (mod as {default?: DhikrTranslationBundle}).default ??
      (mod as DhikrTranslationBundle);
  } catch {
    bundleCache[key] = null;
  }
  return bundleCache[key];
}

/**
 * Overlay a bundle's translated fields onto a dhikr. Fields absent from the
 * bundle keep the English value already on the object.
 */
export function applyDhikrTranslation(
  dhikr: Dhikr,
  bundle: DhikrTranslationBundle | null,
): Dhikr {
  if (!bundle) return dhikr;
  const entry = bundle[dhikr.id];
  if (!entry) return dhikr;
  return {
    ...dhikr,
    translation: entry.translation ?? dhikr.translation,
    instruction: entry.instruction ?? dhikr.instruction,
  };
}

/** Overlay a bundle onto a list of adhkar (no-op when there is no bundle). */
export function applyDhikrTranslations(
  adhkar: Dhikr[],
  bundle: DhikrTranslationBundle | null,
): Dhikr[] {
  if (!bundle) return adhkar;
  return adhkar.map(d => applyDhikrTranslation(d, bundle));
}
