import type {Dhikr} from '@/types/adhkar';

/**
 * Per-language translations of dhikr body text (translation / instruction).
 *
 * Religious text is translated by humans, never machine-translated. Bundle
 * files live in data/adhkar-translations/<locale>.json as sparse maps from
 * dhikr id to the translated fields:
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
const bundleLoaders: Record<string, BundleLoader> = {};

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
  if (locale in bundleCache) return bundleCache[locale];
  const loader = bundleLoaders[locale];
  if (!loader) {
    bundleCache[locale] = null;
    return null;
  }
  try {
    const mod = loader();
    bundleCache[locale] =
      (mod as {default?: DhikrTranslationBundle}).default ??
      (mod as DhikrTranslationBundle);
  } catch {
    bundleCache[locale] = null;
  }
  return bundleCache[locale];
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
