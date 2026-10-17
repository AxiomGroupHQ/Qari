import type {Dhikr} from '@/types/adhkar';
import {
  applyDhikrTranslation,
  applyDhikrTranslations,
  getDhikrTranslationBundle,
  registerDhikrTranslationBundle,
  setDownloadedDhikrTranslationBundle,
} from '../dhikrTranslations';

const baseDhikr: Dhikr = {
  id: '75',
  categoryId: '27',
  arabic: 'arabic',
  translation: 'English translation',
  transliteration: null,
  instruction: 'English instruction',
  repeatCount: 1,
  audioFile: null,
  sortOrder: 1,
};

describe('applyDhikrTranslation', () => {
  it('returns the dhikr unchanged when there is no bundle', () => {
    expect(applyDhikrTranslation(baseDhikr, null)).toBe(baseDhikr);
  });

  it('returns the dhikr unchanged when the id is not in the bundle', () => {
    expect(applyDhikrTranslation(baseDhikr, {999: {translation: 'x'}})).toBe(
      baseDhikr,
    );
  });

  it('overlays translated fields and keeps English for missing fields', () => {
    const out = applyDhikrTranslation(baseDhikr, {
      '75': {translation: 'Übersetzung'},
    });
    expect(out.translation).toBe('Übersetzung');
    expect(out.instruction).toBe('English instruction');
    expect(out.arabic).toBe('arabic');
  });

  it('overlays instruction when present', () => {
    const out = applyDhikrTranslation(baseDhikr, {
      '75': {translation: 'Übersetzung', instruction: 'Anleitung'},
    });
    expect(out.instruction).toBe('Anleitung');
  });
});

describe('applyDhikrTranslations', () => {
  it('returns the same list when there is no bundle', () => {
    const list = [baseDhikr];
    expect(applyDhikrTranslations(list, null)).toBe(list);
  });

  it('overlays each dhikr in the list', () => {
    const other: Dhikr = {...baseDhikr, id: '76'};
    const out = applyDhikrTranslations([baseDhikr, other], {
      '75': {translation: 'Übersetzung'},
    });
    expect(out[0].translation).toBe('Übersetzung');
    expect(out[1].translation).toBe('English translation');
  });
});

describe('getDhikrTranslationBundle', () => {
  it('returns null for a locale with no registered bundle', () => {
    expect(getDhikrTranslationBundle('zz')).toBeNull();
  });

  it('loads and caches a registered bundle', () => {
    const loader = jest.fn(() => ({default: {'75': {translation: 'de'}}}));
    registerDhikrTranslationBundle('de-test', loader);
    expect(getDhikrTranslationBundle('de-test')).toEqual({
      '75': {translation: 'de'},
    });
    getDhikrTranslationBundle('de-test');
    expect(loader).toHaveBeenCalledTimes(1);
  });
});

describe('downloaded bundles', () => {
  it('prefers a downloaded bundle over a shipped one', () => {
    registerDhikrTranslationBundle('dltest', () => ({
      default: {'75': {translation: 'shipped'}},
    }));
    setDownloadedDhikrTranslationBundle('dltest', {
      '75': {translation: 'downloaded'},
    });
    expect(getDhikrTranslationBundle('dltest')).toEqual({
      '75': {translation: 'downloaded'},
    });
    expect(getDhikrTranslationBundle('dltest-XX')).toEqual({
      '75': {translation: 'downloaded'},
    });
  });
});
