/**
 * Validates shipped machine-translated adhkar bundles:
 * real dhikr ids only, no Arabic text leaked into translated fields,
 * high coverage of the seeded adhkar, and a matching unreviewed meta file.
 */
import adhkarSeed from '@/data/adhkar.json';
import {
  getDhikrTranslationBundle,
  registerDhikrTranslationBundle,
} from '../dhikrTranslations';

const MT_LOCALES = ['ckb', 'wo', 'bm', 'ff', 'mnk', 'nl', 'el', 'mk', 'mr', 'my', 'pa', 'prs', 'ti'];

// Locales written in an Arabic-derived script legitimately contain Arabic
// characters in their translations, so the no-Arabic leak check cannot
// apply; instead we assert the translation is not a copy of the source
// Arabic text.
const ARABIC_SCRIPT_LOCALES = new Set(['ckb', 'prs']);
const seedById = new Map(
  (adhkarSeed as {adhkar: {id: string; arabic?: string}[]}).adhkar.map(d => [
    d.id,
    d,
  ]),
);

const validIds = new Set(
  (adhkarSeed as {adhkar: {id: string}[]}).adhkar.map(d => d.id),
);
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

describe('machine-translated adhkar bundles', () => {
  it.each(MT_LOCALES)('%s: valid ids, translated fields, coverage', locale => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bundle = require(`@/data/adhkar-translations/${locale}.json`) as Record<
      string,
      {translation?: string; instruction?: string}
    >;
    const ids = Object.keys(bundle);
    expect(ids.length).toBeGreaterThanOrEqual(400);
    expect(ids.length).toBeGreaterThanOrEqual(validIds.size * 0.95);
    for (const id of ids) {
      expect(validIds.has(id)).toBe(true);
      const entry = bundle[id];
      expect(
        typeof entry.translation === 'string' ||
          typeof entry.instruction === 'string',
      ).toBe(true);
      if (ARABIC_SCRIPT_LOCALES.has(locale)) {
        const srcArabic = (seedById.get(id) as {arabic?: string})?.arabic;
        if (entry.translation) {
          expect(entry.translation.trim().length).toBeGreaterThan(0);
          if (srcArabic) {
            expect(entry.translation.trim()).not.toBe(srcArabic.trim());
          }
        }
      } else {
        if (entry.translation) {
          expect(entry.translation.trim().length).toBeGreaterThan(0);
          expect(ARABIC.test(entry.translation)).toBe(false);
        }
        if (entry.instruction) {
          expect(entry.instruction.trim().length).toBeGreaterThan(0);
          expect(ARABIC.test(entry.instruction)).toBe(false);
        }
      }
    }
  });

  it.each(MT_LOCALES)('%s: meta flags machine-translated and unreviewed', locale => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const meta = require(`@/data/adhkar-translations/${locale}.meta.json`);
    expect(meta.machineTranslated).toBe(true);
    expect(meta.reviewed).toBe(false);
    expect(meta.locale).toBe(locale);
  });

  it('registered MT locales resolve through the registry', () => {
    for (const locale of MT_LOCALES) {
      expect(getDhikrTranslationBundle(locale)).not.toBeNull();
    }
  });
});

describe('getDhikrTranslationBundle regional fallback', () => {
  it('falls back to the base language for regional locales', () => {
    registerDhikrTranslationBundle('zzq', () => ({
      default: {'75': {translation: 'x'}},
    }));
    expect(getDhikrTranslationBundle('zzq-XX')).toEqual({
      '75': {translation: 'x'},
    });
  });
});
