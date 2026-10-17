/**
 * dhikrTranslationLoader: cache-first remote bundles.
 *
 * Covers the behaviors that keep adhkar readable in every network state:
 *   - English never hits the network (it is the seeded source text)
 *   - a stored bundle is used when the network is down (offline win)
 *   - a newer published version downloads once and is persisted
 *   - an unchanged version does not re-download
 *   - malformed payloads are rejected and the stored copy survives
 *   - regional locales resolve to their base language (nl-BE -> nl)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      removeItem: jest.fn((k: string) => {
        store.delete(k);
        return Promise.resolve();
      }),
      __mockStore: store,
    },
  };
});

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
  },
}));

jest.mock('@/config/branding', () => ({
  __esModule: true,
  default: {apiBaseUrl: 'https://api.test'},
}));

import {
  ensureDhikrTranslationBundle,
  __resetDhikrTranslationLoaderForTests,
} from '../dhikrTranslationLoader';
import {
  getDhikrTranslationBundle,
  setDownloadedDhikrTranslationBundle,
} from '../dhikrTranslations';

const mockStore = (
  AsyncStorage as unknown as {__mockStore: Map<string, string>}
).__mockStore;

const MANIFEST_URL = 'https://api.test/adhkar/manifest.json';
const BUNDLE_URL = 'https://api.test/adhkar/translations/nl.json';
const NL_BUNDLE = {'75': {translation: 'Vertaling'}};

function mockFetch(handlers: Record<string, unknown | null>) {
  global.fetch = jest.fn((url: unknown) => {
    const key = String(url);
    if (!(key in handlers))
      return Promise.reject(new Error('unexpected ' + key));
    const body = handlers[key];
    if (body === null) return Promise.reject(new Error('network down'));
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
  });
}

const MANIFEST = {
  version: 1,
  locales: {nl: {version: 2, entries: 1, url: '/adhkar/translations/nl.json'}},
};

beforeEach(() => {
  mockStore.clear();
  __resetDhikrTranslationLoaderForTests();
  jest.clearAllMocks();
  // Clear any downloaded bundle leaked between tests.
  setDownloadedDhikrTranslationBundle('nl', null as never);
});

afterAll(() => {
  jest.restoreAllMocks();
});

it('never fetches for English', async () => {
  mockFetch({});
  await ensureDhikrTranslationBundle('en');
  expect(global.fetch).not.toHaveBeenCalled();
  expect(getDhikrTranslationBundle('en')).toBeNull();
});

it('uses the stored bundle when the network is down', async () => {
  mockStore.set(
    'istima:adhkarTranslationBundle:nl',
    JSON.stringify({version: 1, bundle: NL_BUNDLE}),
  );
  mockFetch({[MANIFEST_URL]: null});
  await ensureDhikrTranslationBundle('nl');
  expect(getDhikrTranslationBundle('nl')).toEqual(NL_BUNDLE);
});

it('downloads a newer version and persists it', async () => {
  mockFetch({[MANIFEST_URL]: MANIFEST, [BUNDLE_URL]: NL_BUNDLE});
  await ensureDhikrTranslationBundle('nl');
  expect(getDhikrTranslationBundle('nl')).toEqual(NL_BUNDLE);
  const stored = JSON.parse(
    mockStore.get('istima:adhkarTranslationBundle:nl') ?? '{}',
  );
  expect(stored.version).toBe(2);
  expect(stored.bundle).toEqual(NL_BUNDLE);
});

it('does not re-download when the stored version is current', async () => {
  mockStore.set(
    'istima:adhkarTranslationBundle:nl',
    JSON.stringify({version: 2, bundle: NL_BUNDLE}),
  );
  mockFetch({[MANIFEST_URL]: MANIFEST, [BUNDLE_URL]: null});
  await ensureDhikrTranslationBundle('nl');
  expect(global.fetch).toHaveBeenCalledTimes(1); // manifest only
  expect(getDhikrTranslationBundle('nl')).toEqual(NL_BUNDLE);
});

it('rejects a malformed bundle and keeps the stored copy', async () => {
  mockStore.set(
    'istima:adhkarTranslationBundle:nl',
    JSON.stringify({version: 1, bundle: NL_BUNDLE}),
  );
  mockFetch({[MANIFEST_URL]: MANIFEST, [BUNDLE_URL]: ['not', 'a', 'map']});
  await ensureDhikrTranslationBundle('nl');
  expect(getDhikrTranslationBundle('nl')).toEqual(NL_BUNDLE);
  const stored = JSON.parse(
    mockStore.get('istima:adhkarTranslationBundle:nl') ?? '{}',
  );
  expect(stored.version).toBe(1);
});

it('resolves regional locales to the base language', async () => {
  mockFetch({[MANIFEST_URL]: MANIFEST, [BUNDLE_URL]: NL_BUNDLE});
  await ensureDhikrTranslationBundle('nl-BE');
  expect(getDhikrTranslationBundle('nl-BE')).toEqual(NL_BUNDLE);
  expect(mockStore.get('istima:adhkarTranslationBundle:nl')).toBeDefined();
});

it('ensures only once per session per locale', async () => {
  mockFetch({[MANIFEST_URL]: MANIFEST, [BUNDLE_URL]: NL_BUNDLE});
  await ensureDhikrTranslationBundle('nl');
  const calls = (global.fetch as jest.Mock).mock.calls.length;
  await ensureDhikrTranslationBundle('nl');
  expect((global.fetch as jest.Mock).mock.calls.length).toBe(calls);
});
