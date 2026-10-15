#!/usr/bin/env node
/**
 * Apply a small indexed translation file on top of an existing locale.
 * usage: node scripts/i18n-extras.js <code> <translations.txt> <extras-en.txt>
 * extras-en.txt: "flatKey|English" lines (ordered). Keys starting with "native." go to
 * locales/native/<code>.json (iOS Info.plist permission strings); the rest merge into locales/<code>.json.
 * translations.txt: "idx|text" lines. Missing indices keep the existing value.
 */
const fs = require('fs');
const [code, trFile, enFile] = process.argv.slice(2);
const en = fs
  .readFileSync(enFile, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(l => {
    const i = l.indexOf('|');
    return [l.slice(0, i), l.slice(i + 1)];
  });
const flatten = (o, p = '', a = {}) => {
  for (const [k, v] of Object.entries(o))
    typeof v === 'object' ? flatten(v, p + k + '.', a) : (a[p + k] = v);
  return a;
};
const nest = f => {
  const n = {};
  for (const k of Object.keys(f).sort()) {
    const ps = k.split('.');
    let o = n;
    ps.slice(0, -1).forEach(p => (o = o[p] = o[p] || {}));
    o[ps[ps.length - 1]] = f[k];
  }
  return n;
};
const ph = s => (String(s).match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join('|');
const file = `locales/${code}.json`;
const flat = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
const native = fs.existsSync(`locales/native/${code}.json`)
  ? JSON.parse(fs.readFileSync(`locales/native/${code}.json`, 'utf8'))
  : {};
const tr = {};
for (const l of fs.readFileSync(trFile, 'utf8').split('\n').filter(Boolean)) {
  const i = l.indexOf('|');
  tr[parseInt(l.slice(0, i), 10)] = l.slice(i + 1).trim();
}
const lang =
  code === 'prs'
    ? 'fa'
    : code === 'kmr'
      ? 'ku'
      : code === 'ckb'
        ? 'ar'
        : ['ff', 'wo', 'ti', 'om'].includes(code)
          ? 'fr'
          : code;
let cats;
try {
  cats = new Intl.PluralRules(lang).resolvedOptions().pluralCategories;
} catch {
  cats = ['one', 'other'];
}
let bad = 0;
en.forEach(([key, text], idx) => {
  const v = tr[idx];
  if (v === undefined) return;
  if (ph(v) !== ph(text)) {
    console.log('placeholder mismatch', key, v);
    bad++;
    return;
  }
  if (key.startsWith('native.')) {
    native[key.slice(7)] = v;
    return;
  }
  if (key === 'adhkarUi.count') {
    for (const c of ['zero', 'one', 'two', 'few', 'many', 'other'])
      delete flat[`${key}_${c}`];
    for (const c of cats) flat[`${key}_${c}`] = v;
    return;
  }
  flat[key] = v;
});
fs.writeFileSync(file, JSON.stringify(nest(flat), null, 2) + '\n');
if (Object.keys(native).length)
  fs.writeFileSync(
    `locales/native/${code}.json`,
    JSON.stringify(native, null, 2) + '\n',
  );
console.log(code, 'applied', Object.keys(tr).length, 'problems', bad);
