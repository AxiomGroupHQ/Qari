/**
 * Display helpers for adhkar text. The stored data keeps the source's wrapping
 * brackets; these only drop a pair that wraps the whole text.
 */

/** True when the "(" at index 0 is closed by the final ")" of the string. */
function wrapsWholeText(s: string): boolean {
  if (!s.startsWith('(') || !s.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') {
      depth--;
      if (depth === 0) return i === s.length - 1;
    }
  }
  return false;
}

/**
 * The source marks quoted words with "((" and "))", sometimes around the whole
 * text and sometimes around a part of it. Drop those marks. Single brackets
 * inside the text are kept, except one pair that wraps the whole text.
 */
export function cleanArabic(text: string): string {
  let s = text.trim().replace(/\(\(\s*([\s\S]*?)\s*\)\)/g, '$1');
  // Unpaired marks left over in a few entries.
  s = s.replace(/\(\(|\)\)/g, '').trim();
  const m = s.match(/^([\s\S]*?)([.،]?)\s*$/);
  const body = m ? m[1] : s;
  const tail = m ? m[2] : '';
  return wrapsWholeText(body) ? body.slice(1, -1).trim() + tail : s;
}

/** "(translation)" -> "translation". */
export function cleanTranslation(text: string | null): string | null {
  if (text == null) return text;
  let s = text.trim();
  while (wrapsWholeText(s)) s = s.slice(1, -1).trim();
  return s;
}

interface ShareParts {
  arabic: string;
  translation: string | null;
  transliteration: string | null;
}

/**
 * Text for Share. Same order and visibility as the reader: Arabic, then the
 * translation and transliteration the user has switched on. The info note is
 * left out (it is a separate, collapsed section and in some entries repeats
 * the translation in other words).
 */
export function buildShareText(
  d: ShareParts,
  show: {translation: boolean; transliteration: boolean},
): string {
  const parts = [cleanArabic(d.arabic)];
  if (show.translation && d.translation) {
    const t = cleanTranslation(d.translation);
    if (t) parts.push(t);
  }
  if (show.transliteration && d.transliteration) {
    parts.push(d.transliteration.trim());
  }
  return parts.join('\n\n');
}

/**
 * Inline recite-count notes the source keeps inside the text, e.g. the Arabic
 * "(ثلاثاً)" / "[ثلاثاً]" or the English "(three times)". The reader shows the
 * count as a badge instead, so these notes are dropped from the display text.
 */

// Arabic diacritics (tanween, harakat, dagger alef, tatweel) may sit between
// the letters of the note word, e.g. "ثَلاَثَاً", so matching normalizes the
// bracket body with stripDiacritics before the lookup.

const AR_REPEAT_COUNTS: Record<string, number> = {
  'مرة واحدة': 1,
  مرتين: 2,
  ثلاثا: 3,
  ثلاث: 3,
  اربعا: 4,
  اربع: 4,
  خمسا: 5,
  خمس: 5,
  سبعا: 7,
  سبع: 7,
  عشرا: 10,
  عشر: 10,
  مائة: 100,
  مئة: 100,
};

function stripDiacritics(s: string): string {
  return s.replace(/[ً-ْٰـ]/g, '');
}

// Same word list with optional diacritics between letters. Keys above are
// already diacritic-free, so the normalized lookup key matches.
const AR_REPEAT_NOTE = new RegExp('\\s*[(\\[]([^()[\\]]{1,30})[)\\]]', 'g');

const EN_REPEAT_COUNTS: [RegExp, number][] = [
  [/one hundred/i, 100],
  [/thirty[- ]three/i, 33],
  [/once/i, 1],
  [/twice/i, 2],
  [/three/i, 3],
  [/four/i, 4],
  [/five/i, 5],
  [/seven/i, 7],
  [/ten/i, 10],
];

const EN_REPEAT_NOTE =
  /\s*\(\s*((?:one hundred|thirty-three|three|four|five|seven|ten)\s+times?|once|twice)(?:\s+in the (?:morning and evening|morning|evening)|\s+every day)?\s*\)/gi;

function lookupArabicCount(noteBody: string): number | null {
  const normalized = stripDiacritics(noteBody).trim();
  return AR_REPEAT_COUNTS[normalized] ?? null;
}

function lookupEnglishCount(noteBody: string): number | null {
  for (const [re, n] of EN_REPEAT_COUNTS) {
    if (re.test(noteBody)) return n;
  }
  return null;
}

/** Recite count from an inline note in any of the given texts, else null. */
export function repeatCountFromText(
  ...texts: (string | null | undefined)[]
): number | null {
  for (const text of texts) {
    if (!text) continue;
    for (const m of text.matchAll(AR_REPEAT_NOTE)) {
      const n = lookupArabicCount(m[1]);
      if (n != null) return n;
    }
    for (const m of text.matchAll(EN_REPEAT_NOTE)) {
      const n = lookupEnglishCount(m[1]);
      if (n != null) return n;
    }
  }
  return null;
}

/** Drop inline recite-count notes from display text. */
export function stripRepeatNotes(text: string | null): string | null {
  if (text == null) return text;
  let s = text.replace(AR_REPEAT_NOTE, (whole, body: string) =>
    lookupArabicCount(body) != null ? ' ' : whole,
  );
  s = s.replace(EN_REPEAT_NOTE, (whole, body: string) =>
    lookupEnglishCount(body) != null ? ' ' : whole,
  );
  // Tidy up spacing left behind (double spaces, space before punctuation).
  return s
    .replace(/ {2,}/g, ' ')
    .replace(/ +([.،,])/g, '$1')
    .trim();
}
