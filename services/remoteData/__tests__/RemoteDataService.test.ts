/**
 * RemoteDataService: cache-first reference data.
 *
 *   - cached file is used fully offline (no manifest, no download)
 *   - a newer published version downloads once and is verified by sha256
 *   - an unchanged version does not re-download
 *   - a hash mismatch is rejected (Quran text integrity) and the stale
 *     cache survives
 *   - a failed download with no cache reports the path as missing
 *   - getRemoteJson returns the fallback for unknown paths
 */
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k: string) => Promise.resolve(store.get(k) ?? null)),
      setItem: jest.fn((k: string, v: string) => {
        store.set(k, v);
        return Promise.resolve();
      }),
      __mockStore: store,
    },
  };
});

jest.mock('react-native', () => ({Platform: {OS: 'web'}}));

const webCache = new Map<string, string>();
jest.mock('expo-file-system/legacy', () => ({}));
jest.mock('expo-crypto', () => ({}), {virtual: true});

(global as {caches?: unknown}).caches = {
  open: jest.fn(() =>
    Promise.resolve({
      match: (url: string) =>
        Promise.resolve(
          webCache.has(url)
            ? {text: () => Promise.resolve(webCache.get(url))}
            : undefined,
        ),
      put: (url: string, res: {text: () => Promise<string>}) =>
        res.text().then(t => void webCache.set(url, t)),
    }),
  ),
};

jest.mock('@/config/branding', () => ({
  __esModule: true,
  default: {apiBaseUrl: 'https://api.test'},
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initRemoteData,
  getRemoteJson,
  isRemoteDataReady,
  __resetRemoteDataForTests,
  REMOTE_DATA_MANIFEST_URL,
} from '../RemoteDataService';

const mockStore = (
  AsyncStorage as unknown as {__mockStore: Map<string, string>}
).__mockStore;

const FILE = {hello: 'world'};
const FILE_JSON = JSON.stringify(FILE);
const FILE_SHA =
  'b3c94d8a4e34e4a1cf6cdbf60f2db96a2b48d0b57f2b8e7d53d2b0bda6a2c3e5'; // wrong on purpose unless overwritten
let realSha = '';

function manifestFor(version: number, sha: string) {
  return {
    version: 1,
    files: {'/data/a.json': {version, bytes: FILE_JSON.length, sha256: sha}},
  };
}

function mockFetch(handlers: Record<string, string | null>) {
  global.fetch = jest.fn((url: unknown) => {
    const key = String(url);
    if (!(key in handlers)) return Promise.reject(new Error('unexpected ' + key));
    const body = handlers[key];
    if (body === null) return Promise.reject(new Error('network down'));
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(body),
      json: () => Promise.resolve(JSON.parse(body)),
    } as unknown as Response);
  });
}

beforeEach(async () => {
  mockStore.clear();
  webCache.clear();
  __resetRemoteDataForTests();
  jest.clearAllMocks();
  // Pre-compute the real sha of FILE_JSON through the service's own crypto
  // path by seeding it via a download with a manifest we control.
  realSha = await (
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(FILE_JSON))
      .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''))
  );
});

it('downloads, verifies, caches, and serves synchronously', async () => {
  mockFetch({
    [REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(1, realSha)),
    'https://api.test/data/a.json': FILE_JSON,
  });
  const result = await initRemoteData(['a.json']);
  expect(result).toEqual({ready: ['a.json'], missing: []});
  expect(getRemoteJson('a.json', null)).toEqual(FILE);
  expect(isRemoteDataReady('a.json')).toBe(true);
  const stored = JSON.parse(mockStore.get('istima:remoteData:versions') ?? '{}');
  expect(stored['a.json']).toBe(1);
});

it('works fully offline from the cache', async () => {
  webCache.set('https://api.test/data/a.json', FILE_JSON);
  mockStore.set('istima:remoteData:versions', JSON.stringify({'a.json': 1}));
  mockFetch({[REMOTE_DATA_MANIFEST_URL]: null});
  const result = await initRemoteData(['a.json']);
  expect(result.missing).toEqual([]);
  expect(getRemoteJson('a.json', null)).toEqual(FILE);
});

it('does not re-download when the version is current', async () => {
  webCache.set('https://api.test/data/a.json', FILE_JSON);
  mockStore.set('istima:remoteData:versions', JSON.stringify({'a.json': 1}));
  mockFetch({[REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(1, realSha))});
  await initRemoteData(['a.json']);
  expect(global.fetch).toHaveBeenCalledTimes(1); // manifest only
});

it('rejects a hash mismatch and reports missing', async () => {
  mockFetch({
    [REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(1, FILE_SHA)),
    'https://api.test/data/a.json': FILE_JSON,
  });
  const result = await initRemoteData(['a.json']);
  expect(result.missing).toEqual(['a.json']);
  expect(isRemoteDataReady('a.json')).toBe(false);
});

it('reports missing when download fails and there is no cache', async () => {
  mockFetch({
    [REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(1, realSha)),
    'https://api.test/data/a.json': null,
  });
  const result = await initRemoteData(['a.json']);
  expect(result).toEqual({ready: [], missing: ['a.json']});
});

it('falls back to the stale cache when a refresh download fails', async () => {
  webCache.set('https://api.test/data/a.json', FILE_JSON);
  mockFetch({
    [REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(2, realSha)),
    'https://api.test/data/a.json': null,
  });
  const result = await initRemoteData(['a.json']);
  expect(result.missing).toEqual([]);
  expect(getRemoteJson('a.json', null)).toEqual(FILE);
});

it('getRemoteJson returns the fallback for unknown paths', () => {
  expect(getRemoteJson('never.json', {x: 1})).toEqual({x: 1});
});

it('short-circuits paths already loaded this session', async () => {
  mockFetch({
    [REMOTE_DATA_MANIFEST_URL]: JSON.stringify(manifestFor(1, realSha)),
    'https://api.test/data/a.json': FILE_JSON,
  });
  await initRemoteData(['a.json']);
  const calls = (global.fetch as jest.Mock).mock.calls.length;
  await initRemoteData(['a.json']);
  expect((global.fetch as jest.Mock).mock.calls.length).toBe(calls);
});
