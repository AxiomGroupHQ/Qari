import {cleanArabic, cleanTranslation} from '../adhkarText';
import adhkar from '@/data/adhkar.json';

describe('adhkar bracket stripping', () => {
  it('removes wrapping double brackets and keeps the final full stop', () => {
    expect(cleanArabic('((بسم الله)).')).toBe('بسم الله.');
    expect(cleanArabic('((بسم الله))')).toBe('بسم الله');
  });
  it('keeps brackets that belong to the text', () => {
    expect(cleanArabic('قال (كذا) ثم')).toBe('قال (كذا) ثم');
    expect(cleanArabic('((أ (ب) ج))')).toBe('أ (ب) ج');
  });
  it('removes wrapping brackets around a translation only', () => {
    expect(cleanTranslation('(Praise be to God)')).toBe('Praise be to God');
    expect(cleanTranslation('( 285 ) The Messenger')).toBe(
      '( 285 ) The Messenger',
    );
    expect(cleanTranslation(null)).toBeNull();
  });
  it('no entry starts with a wrapping bracket after cleaning', () => {
    const bad = (adhkar.adhkar as {arabic: string; translation: string}[])
      .map(a => cleanArabic(a.arabic))
      .filter(s => s.startsWith('(('));
    expect(bad).toEqual([]);
    const left = (adhkar.adhkar as {arabic: string}[]).filter(a =>
      /\(\(|\)\)/.test(cleanArabic(a.arabic)),
    );
    expect(left.length).toBe(0);
  });
});
