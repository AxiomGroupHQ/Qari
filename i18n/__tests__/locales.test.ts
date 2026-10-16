import fs from 'fs';
import path from 'path';
import {
  LOCALES,
  LOCALE_CODES,
  isRtlLocale,
  matchDeviceLocale,
} from '@/i18n/locales';

const localesDir = path.join(__dirname, '..', '..', 'locales');
type Tree = {[k: string]: string | Tree};
const flatten = (o: Tree, p = ''): Record<string, string> =>
  Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    if (typeof v === 'string') acc[p + k] = v;
    else Object.assign(acc, flatten(v, `${p}${k}.`));
    return acc;
  }, {});
const placeholders = (s: string) =>
  (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).sort().join('|');

describe('locale registry', () => {
  it('has the 60 requested interface locales, all unique', () => {
    expect(LOCALES).toHaveLength(60);
    expect(new Set(LOCALE_CODES).size).toBe(60);
  });
  it('marks Arabic, Urdu, Persian, Dari, Pashto, Uyghur and Sorani as RTL', () => {
    ['ar', 'ur', 'fa', 'prs', 'ps', 'ug', 'ckb'].forEach(c =>
      expect(isRtlLocale(c)).toBe(true),
    );
    ['en', 'tr', 'kmr', 'id'].forEach(c => expect(isRtlLocale(c)).toBe(false));
  });
  it('maps device locale tags', () => {
    expect(matchDeviceLocale('ar-SA')).toBe('ar');
    expect(matchDeviceLocale('fa-AF')).toBe('prs');
    expect(matchDeviceLocale('ku-IQ')).toBe('ckb');
    expect(matchDeviceLocale('tl-PH')).toBe('fil');
    expect(matchDeviceLocale('zh-Hans-CN')).toBe('zh');
    expect(matchDeviceLocale('xx')).toBeNull();
  });
});

describe('locale files', () => {
  const en = flatten(
    JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8')),
  );
  const files = fs
    .readdirSync(localesDir)
    .filter(f => f.endsWith('.json') && f !== 'en.json');
  it('en.json is non-empty', () =>
    expect(Object.keys(en).length).toBeGreaterThan(300));
  (files.length ? it.each(files) : it.skip.each(['none']))(
    '%s only uses keys from en.json and keeps placeholders',
    file => {
      const code = file.replace('.json', '');
      expect(LOCALE_CODES).toContain(code);
      const tr = flatten(
        JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8')),
      );
      Object.entries(tr).forEach(([k, v]) => {
        const base = k.replace(/_(zero|one|two|few|many|other)$/, '');
        const ref = en[k] ?? en[`${base}_other`] ?? en[`${base}_one`];
        expect(ref).toBeDefined();
        expect(placeholders(v)).toBe(placeholders(ref));
      });
    },
  );
});

describe('extras', () => {
  const others = fs
    .readdirSync(localesDir)
    .filter(f => f.endsWith('.json') && f !== 'en.json');
  it('common.rev means revelation order, not reverse', () => {
    const en = JSON.parse(
      fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'),
    );
    expect(en.common.rev).toBe('Revelation');
    others.forEach(f => {
      const j = JSON.parse(fs.readFileSync(path.join(localesDir, f), 'utf8'));
      expect(j.common.rev).not.toBe('Rev');
      expect(j.common.rev).not.toBe('Reverse');
    });
  });
  it.each(others)('%s has the Adhkar UI strings', f => {
    const j = JSON.parse(fs.readFileSync(path.join(localesDir, f), 'utf8'));
    expect(j.adhkarUi.noneFound).toBeTruthy();
    expect(j.adhkarUi.position).toContain('{{current}}');
  });
  it('every non-English locale has localized permission strings', () => {
    others.forEach(f => {
      const p = path.join(localesDir, 'native', f);
      expect(fs.existsSync(p)).toBe(true);
      const n = JSON.parse(fs.readFileSync(p, 'utf8'));
      expect(Object.keys(n).sort()).toEqual([
        'NSAppleMusicUsageDescription',
        'NSCameraUsageDescription',
        'NSMicrophoneUsageDescription',
      ]);
    });
  });
});

describe('share and discover strings', () => {
  const keys = [
    'sharedPlaylist.title',
    'sharedPlaylist.play',
    'sharedPlaylist.save',
    'sharedPlaylist.saved',
    'sharedPlaylist.loading',
    'sharedPlaylist.notFound',
    'sharedPlaylist.error',
    'sharedPlaylist.retry',
    'discover.title',
    'discover.loading',
    'discover.empty',
    'discover.retry',
    'discover.close',
    'discover.paused',
    'sheets.playlistContextSheet.sharePlaylist',
    'sheets.playlistContextSheet.shareFailed',
    'sheets.playlistContextSheet.shareRateLimited',
    'sheets.playlistContextSheet.shareNothing',
    'sheets.playlistContextSheet.shareMessage',
  ];
  const en = flatten(
    JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8')),
  );
  LOCALE_CODES.filter(c => c !== 'en').forEach(code => {
    it(`${code} translates them and keeps placeholders`, () => {
      const l = flatten(
        JSON.parse(
          fs.readFileSync(path.join(localesDir, `${code}.json`), 'utf8'),
        ),
      );
      keys.forEach(k => {
        expect(l[k]).toBeTruthy();
        expect(l[k]).not.toBe(en[k]);
        expect(placeholders(l[k])).toBe(placeholders(en[k]));
      });
      expect(l['sharedPlaylist.itemCount_other']).toContain('{{count}}');
    });
  });
});
