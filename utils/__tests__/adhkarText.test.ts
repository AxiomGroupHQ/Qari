import {
  cleanArabic,
  cleanTranslation,
  repeatCountFromText,
  stripRepeatNotes,
} from '../adhkarText';
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

describe('share text', () => {
  const {buildShareText} = jest.requireActual('../adhkarText');
  const d = {
    arabic: '((قال)).',
    translation: '(Whoever says it)',
    transliteration: 'qaala',
  };
  it('follows the display settings and drops brackets', () => {
    expect(buildShareText(d, {translation: true, transliteration: true})).toBe(
      'قال.\n\nWhoever says it\n\nqaala',
    );
    expect(
      buildShareText(d, {translation: false, transliteration: false}),
    ).toBe('قال.');
  });
});

describe('stripRepeatNotes + repeatCountFromText', () => {
  it('drops the Arabic "(ثلاثاً)" note, with or without diacritics', () => {
    expect(
      stripRepeatNotes(
        'أَسْتَغْفِرُ اللَّهَ (ثَلاَثَاً) اللَّهُمَّ أَنْتَ السَّلاَمُ.',
      ),
    ).toBe('أَسْتَغْفِرُ اللَّهَ اللَّهُمَّ أَنْتَ السَّلاَمُ.');
    expect(
      stripRepeatNotes('لاَ إِلَهَ إِلاَّ اللَّهُ [ثلاثاً]، اللَّهُمَّ'),
    ).toBe('لاَ إِلَهَ إِلاَّ اللَّهُ، اللَّهُمَّ');
  });

  it('drops English "(three times)" style notes', () => {
    expect(
      stripRepeatNotes('I ask Allah for forgiveness.(three times) (O Allah)'),
    ).toBe('I ask Allah for forgiveness. (O Allah)');
    expect(stripRepeatNotes('Glorified.(Three Times)')).toBe('Glorified.');
    expect(stripRepeatNotes('Some words.(one hundred times every day)')).toBe(
      'Some words.',
    );
    expect(stripRepeatNotes(null)).toBeNull();
  });

  it('keeps bracketed content that is not a recite-count note', () => {
    expect(
      stripRepeatNotes('for the evening, one reads (amsaytu) instead.'),
    ).toBe('for the evening, one reads (amsaytu) instead.');
  });

  it('extracts the recite count from a note', () => {
    expect(
      repeatCountFromText('أَسْتَغْفِرُ اللَّهَ (ثَلاَثَاً) اللَّهُمَّ'),
    ).toBe(3);
    expect(repeatCountFromText('... [ثلاثاً] ...')).toBe(3);
    expect(repeatCountFromText('Glorified.(Three Times)')).toBe(3);
    expect(repeatCountFromText('(one hundred times)')).toBe(100);
    expect(repeatCountFromText('(thirty-three times)')).toBe(33);
    expect(repeatCountFromText('no note here')).toBeNull();
  });
});
