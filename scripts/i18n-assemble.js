#!/usr/bin/env node
/**
 * Assemble locales/<code>.json from an indexed translation list.
 * usage: node scripts/i18n-assemble.js <code> <translations.txt> <keys.json> [have.json]
 * keys.json: ordered object {flatKey: englishText}; translations.txt: "idx|text" lines.
 * Fills every CLDR plural category the locale needs and validates placeholders.
 */
const fs = require('fs');
const [code, trFile, keysFile, haveFile] = process.argv.slice(2);
const keys = Object.keys(JSON.parse(fs.readFileSync(keysFile, 'utf8')));
const en = JSON.parse(fs.readFileSync(keysFile, 'utf8'));
const have = haveFile ? JSON.parse(fs.readFileSync(haveFile, 'utf8')) : {};
const flat = {...have};
const lines = fs.readFileSync(trFile, 'utf8').split('\n').filter(Boolean);
const idxs = new Set();
for (const l of lines) {
  const i = l.indexOf('|');
  const n = parseInt(l.slice(0, i), 10);
  if (!(n in keys)) throw new Error('bad index ' + n);
  idxs.add(n);
  flat[keys[n]] = l.slice(i + 1).trim();
}
const ph = s => (String(s).match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join('|');
const enAll = JSON.parse(fs.readFileSync('/tmp/en-flat.json', 'utf8'));
// plural completion
const cats = new Intl.PluralRules(
  code === 'prs'
    ? 'fa'
    : code === 'kmr'
    ? 'ku'
    : code === 'ckb'
    ? 'ar'
    : code === 'mnk' ||
      code === 'ff' ||
      code === 'wo' ||
      code === 'bm' ||
      code === 'ti' ||
      code === 'om'
    ? 'fr'
    : code,
).resolvedOptions().pluralCategories;
const bases = new Set(
  Object.keys(enAll)
    .filter(k => /_(one|other)$/.test(k))
    .map(k => k.replace(/_(one|other)$/, '')),
);
for (const b of bases) {
  const one = flat[b + '_one'],
    other = flat[b + '_other'];
  if (one === undefined || other === undefined) continue;
  if (code === 'ar') {
    // Arabic: 3-10 take the plural noun; 11+ and 100+ take the singular noun.
    flat[`${b}_zero`] = other;
    flat[`${b}_two`] = one;
    flat[`${b}_few`] = other;
    flat[`${b}_many`] = one;
    flat[`${b}_other`] = one;
    continue;
  }
  for (const c of cats) {
    if (flat[`${b}_${c}`] !== undefined) continue;
    flat[`${b}_${c}`] =
      code === 'ar' || code === 'ckb'
        ? ['zero', 'few'].includes(c)
          ? other
          : one
        : c === 'one'
        ? one
        : other;
  }
  if (!cats.includes('one')) delete flat[b + '_one'];
  if (!cats.includes('other')) delete flat[b + '_other'];
}
let bad = 0;
for (const [k, v] of Object.entries(flat)) {
  const base = k.replace(/_(zero|one|two|few|many|other)$/, '');
  const ref = enAll[k] ?? enAll[base + '_other'];
  if (ref === undefined) {
    console.log('unknown key', k);
    bad++;
    continue;
  }
  if (ph(v) !== ph(ref)) {
    console.log('placeholder mismatch', k, v);
    bad++;
  }
}
const nest = {};
for (const k of Object.keys(flat).sort()) {
  const parts = k.split('.');
  let o = nest;
  parts.slice(0, -1).forEach(p => (o = o[p] = o[p] || {}));
  o[parts[parts.length - 1]] = flat[k];
}
fs.writeFileSync(`locales/${code}.json`, JSON.stringify(nest, null, 2) + '\n');
console.log(
  code,
  'keys',
  Object.keys(flat).length,
  'translated lines',
  idxs.size,
  'problems',
  bad,
);
