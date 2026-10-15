/* Merges legacy interface messages + hand-written keys into locales/en.json */
const fs = require('fs');
const deep = (a, b) => {
  for (const k in b)
    a[k] = b[k] && typeof b[k] === 'object' ? deep(a[k] || {}, b[k]) : b[k];
  return a;
};
const sort = o =>
  Object.keys(o)
    .sort()
    .reduce(
      (r, k) => (
        (r[k] = o[k] && typeof o[k] === 'object' ? sort(o[k]) : o[k]),
        r
      ),
      {},
    );
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
const legacy = {
  ui: {
    appName: 'Istima',
    home: 'Home',
    surahs: 'Surahs',
    collection: 'Collection',
    search: 'Search',
    library: 'Library',
    settings: 'Settings',
    language: 'Language',
    play: 'Play',
    pause: 'Pause',
    download: 'Download',
    downloads: 'Downloads',
    favorites: 'Favorites',
    retry: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    offline: 'You are offline',
    error: 'Something went wrong',
    noResults: 'No results found',
  },
};
deep(en, legacy);
deep(en, JSON.parse(fs.readFileSync('scripts/i18n-en-extra.json', 'utf8')));
fs.writeFileSync('locales/en.json', JSON.stringify(sort(en), null, 2) + '\n');
const count = o =>
  Object.values(o).reduce(
    (n, v) => n + (typeof v === 'object' ? count(v) : 1),
    0,
  );
console.log('en.json keys:', count(en));
