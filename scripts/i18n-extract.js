#!/usr/bin/env node
/**
 * One-off codemod: wraps hardcoded user-facing English strings in t('key') and
 * writes locales/en.json. Skips religious content and module-level literals
 * (reported in /tmp/i18n-manual.txt). Run from repo root.
 */
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOTS = ['app', 'components'];
const SKIP_PATH = [
  /__tests__/,
  /components\/AdhkarView/,
  /components\/adhkar\//,
  /app\/\(tabs\)\/\(a\.home\)\/adhkar\//,
  /components\/sheets\/Adhkar/,
  /components\/DevMenu/,
  /components\/legal\//,
  /components\/changelog\//,
];
const ATTRS = new Set([
  'title','placeholder','label','accessibilityLabel','accessibilityHint','headerTitle',
  'subtitle','description','message','emptyText','text','emptyTitle','emptyMessage',
  'section','buttonText','confirmText','cancelText','heading','caption','name_','hint','tabBarLabel',
]);
const PROP_NAMES = new Set([...ATTRS].filter(a => a !== 'name_'));
// Proper names / religious labels that must stay as-is.
const KEEP = /^(Halalweb|A'n|Istima|ISTIMA|Madani|Hafs|Warsh|Qalun|Shu'bah|Al-?Bazzi|Qunbul|Al-?Duri|Al-?Susi|Digital Khatt|QCF|IndoPak|KFGQPC|Murattal|Mojawwad|Molim|Basmalah?|Basmallah|Bismillah|Alhamdulillah)$/i;
const EDITION = /\b(Madani|King Fahd|Naskh|Indo-?Pak|Uthmani|Hafs|Warsh|Qalun|Shu'bah|Bazzi|Qunbul|Duri|Susi|\d{4})\b/;

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f)) files.push(p);
  }
})(ROOTS[0]) || 0;
ROOTS.slice(1).forEach(r => (function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f)) files.push(p);
  }
})(r));

const hasLetters = s => /\p{L}/u.test(s);
const hasArabic = s => /[\u0600-\u06FF\u0750-\u077F]/.test(s);
const isCandidate = s => {
  const v = s.trim();
  if (v.length < 2 || !hasLetters(v) || hasArabic(v)) return false;
  if (/^[a-z]+(-[a-z]+)*$/.test(v) && !v.includes(' ')) return false; // enum-ish lowercase
  if (/^[A-Za-z0-9_./:#@-]+$/.test(v) && !/^[A-Z][a-z]/.test(v)) return false; // identifiers/urls
  if (/^https?:|^\//.test(v) || /\.(png|jpg|mp3|json)$/.test(v)) return false;
  if (/^[A-Z_]+$/.test(v)) return false;
  if (KEEP.test(v) || EDITION.test(v)) return false;
  return true;
};
const camel = s => {
  const w = s.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 5);
  return w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase())).join('') || 'text';
};
const scopeOf = file => {
  let p = file.replace(/\.(tsx|ts)$/, '').replace(/^(app|components)\//, '');
  p = p.replace(/\(([a-z])\.([a-z]+)\)/g, '$2').replace(/[()[\]]/g, '');
  const parts = p.split('/').filter(x => x !== 'index' && x !== '_layout');
  const base = parts.slice(-2).join('.').replace(/[^A-Za-z0-9.]/g, '');
  return base.replace(/\.(\w)/g, (_, c) => '.' + c.toLowerCase()).replace(/^(\w)/, c => c.toLowerCase());
};

// Pass 1 collect
const found = []; // {file, kind, text, pos,end, mode}
const manual = [];
for (const file of files) {
  if (SKIP_PATH.some(r => r.test(file))) continue;
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const inFunction = n => {
    for (let c = n.parent; c; c = c.parent) {
      if (ts.isFunctionLike(c) && !ts.isClassLike(c)) return true;
    }
    return false;
  };
  const inJsxAttrObject = n => false;
  const visit = n => {
    if (ts.isJsxText(n)) {
      const raw = n.getText(sf);
      const text = raw.replace(/\s+/g, ' ').trim();
      const sibs = n.parent && n.parent.children ? n.parent.children : [];
      const mixed = sibs.some(c => c !== n && ts.isJsxExpression(c));
      if (text && /&[a-z]+;|&#\d+;|[=<>{}]|'\}/.test(text)) {
        manual.push({file, kind: 'jsx-entity-or-code', text});
      } else if (text && mixed && isCandidate(text)) {
        manual.push({file, kind: 'jsx-mixed-interpolation', text});
      } else if (text && isCandidate(text) && !/^[{}()=;,.•·]+$/.test(text) && !/[•·:]$|^[•·]/.test(text)) {
        const lead = raw.match(/^\s*/)[0];
        const trail = raw.match(/\s*$/)[0];
        found.push({file, kind: 'jsx', text, pos: n.getStart(sf) + lead.length, end: n.getEnd() - trail.length, inFn: inFunction(n)});
      }
    } else if (ts.isJsxAttribute(n) && ATTRS.has(n.name.getText(sf)) && n.initializer && ts.isStringLiteral(n.initializer)) {
      const text = n.initializer.text;
      if (isCandidate(text)) found.push({file, kind: 'attr', text, pos: n.initializer.getStart(sf), end: n.initializer.getEnd(), inFn: inFunction(n)});
    } else if (ts.isPropertyAssignment(n) && n.name && PROP_NAMES.has(n.name.getText(sf).replace(/['"]/g, '')) && ts.isStringLiteral(n.initializer)) {
      const text = n.initializer.text;
      if (isCandidate(text)) found.push({file, kind: 'prop', text, pos: n.initializer.getStart(sf), end: n.initializer.getEnd(), inFn: inFunction(n), pa: {pos: n.getStart(sf), end: n.getEnd(), name: n.name.getText(sf)}});
    } else if (ts.isConditionalExpression(n) && /^isArabicInterface\(\)$/.test(n.condition.getText(sf)) && ts.isStringLiteralLike(n.whenTrue) && ts.isStringLiteralLike(n.whenFalse)) {
      found.push({file, kind: 'arcond', text: n.whenFalse.text, ar: n.whenTrue.text, pos: n.getStart(sf), end: n.getEnd(), inFn: inFunction(n), pa: ts.isPropertyAssignment(n.parent) ? {pos: n.parent.getStart(sf), end: n.parent.getEnd(), name: n.parent.name.getText(sf)} : null});
      return; // do not descend
    } else if (ts.isCallExpression(n) && /^(Alert\.alert|alert)$/.test(n.expression.getText(sf))) {
      n.arguments.slice(0, 2).forEach(a => {
        if (ts.isStringLiteral(a) && isCandidate(a.text)) found.push({file, kind: 'alert', text: a.text, pos: a.getStart(sf), end: a.getEnd(), inFn: inFunction(n)});
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// Key assignment
const counts = new Map();
found.forEach(f => counts.set(f.text, (counts.get(f.text) || new Set()).add(f.file)));
const en = {};
const arSeed = {};
const usedKeys = new Map(); // key -> text
const setKey = (ns, key, text) => {
  let k = key, i = 2;
  while (usedKeys.has(`${ns}.${k}`) && usedKeys.get(`${ns}.${k}`) !== text) k = key + i++;
  usedKeys.set(`${ns}.${k}`, text);
  const [a, ...rest] = `${ns}.${k}`.split('.');
  if (setKey.ar) { arSeed[`${ns}.${k}`] = setKey.ar; setKey.ar = null; }
  let o = en; [a, ...rest.slice(0, -1)].forEach(p => (o = o[p] = o[p] && typeof o[p] === 'object' ? o[p] : {}));
  o[rest[rest.length - 1]] = text;
  return `${ns}.${k}`;
};
const keyFor = f => {
  const shared = counts.get(f.text).size >= 2 && f.text.split(/\s+/).length <= 4;
  return shared ? setKey('common', camel(f.text), f.text) : setKey(scopeOf(f.file), camel(f.text), f.text);
};

const byFile = new Map();
found.forEach(f => { if (f.inFn || f.pa) { setKey.ar = f.ar || null; f.key = keyFor(f); (byFile.get(f.file) || byFile.set(f.file, []).get(f.file)).push(f); } else manual.push(f); });

let edits = 0, filesChanged = 0;
for (const [file, list] of byFile) {
  let src = fs.readFileSync(file, 'utf8');
  const hasT = /\b(const|let|var|function)\s+t\b|\bt\s*[:=]\s*\(|[(,]\s*t\s*[,)]\s*(=>|:)/.test(src);
  const fn = hasT ? 'translate' : 't';
  list.sort((a, b) => b.pos - a.pos).forEach(f => {
    const call = `${fn}('${f.key}')`;
    let rep;
    if (!f.inFn) { f.pos = f.pa.pos; f.end = f.pa.end; rep = `get ${f.pa.name}() { return ${call}; }`; }
    else if (f.kind === 'jsx') rep = `{${call}}`;
    else if (f.kind === 'attr') rep = `{${call}}`;
    else if (f.kind === 'arcond') rep = call;
    else rep = call;
    src = src.slice(0, f.pos) + rep + src.slice(f.end);
    edits++;
  });
  if (!/isArabicInterface\(\)/.test(src.replace(/import[^\n]*isArabicInterface[^\n]*\n/, ''))) src = src.replace(/import \{isArabicInterface\} from '@\/localization\/arabicInterface';\n/, '');
  const imp = hasT ? `import {t as translate} from '@/i18n';\n` : `import {t} from '@/i18n';\n`;
  // insert after last top-level import
  const sf2 = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  let last = 0;
  sf2.statements.forEach(s => { if (ts.isImportDeclaration(s)) last = s.getEnd(); });
  src = src.slice(0, last) + '\n' + imp.trimEnd() + src.slice(last);
  if (APPLY) fs.writeFileSync(file, src);
  filesChanged++;
}
const sortObj = o => Object.keys(o).sort().reduce((a, k) => ((a[k] = typeof o[k] === 'object' ? sortObj(o[k]) : o[k]), a), {});
if (APPLY) fs.writeFileSync('/tmp/ar-seed.json', JSON.stringify(arSeed, null, 1));
if (APPLY) fs.writeFileSync('locales/en.json', JSON.stringify(sortObj(en), null, 2) + '\n');
fs.writeFileSync('/tmp/i18n-manual.txt', manual.map(m => `${m.file} [${m.kind}] ${m.text}`).join('\n'));
console.log({apply: APPLY, filesChanged, edits, uniqueKeys: usedKeys.size, manualModuleLevel: manual.length});
