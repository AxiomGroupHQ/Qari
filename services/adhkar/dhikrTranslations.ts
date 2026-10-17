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
 * Registry of shipped bundles. Populated (via scripts/generate-adhkar-
 * translations-index or manual entry) when a reviewed human translation for
 * a language lands. Empty means every language reads the English source.
 */
const bundleLoaders: Record<string, BundleLoader> = {
  // Model-authored and UNREVIEWED - see the locale's
  // data/adhkar-translations/<locale>.meta.json. Replace with the approved
  // human translation when the team confirms one.
  ckb: () => require('../../data/adhkar-translations/ckb.json'),
  wo: () => require('../../data/adhkar-translations/wo.json'),
};

const bundleCache: Record<string, DhikrTranslationBundle | null> = {};

/** Register a bundle loader (used by the generated index and tests). */
export function registerDhikrTranslationBundle(
  locale: string,
  loader: BundleLoader,
): void {
  bundleLoaders[locale] = loader;
  delete bundleCache[locale];
}

/** Load the bundle for a locale, or null when none ships. Cached. */
export function getDhikrTranslationBundle(
  locale: string,
): DhikrTranslationBundle | null {
  // Fall back to the base language for regional locales (nl-BE -> nl).
  const key =
    locale in bundleLoaders ? locale : (locale.split('-')[0] ?? locale);
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
