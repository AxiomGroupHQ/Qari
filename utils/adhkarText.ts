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
