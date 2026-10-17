/**
 * Remote dhikr translation bundles.
 *
 * The per-locale bundles live in the qari-api repo and are served from
 * https://iapi.istima.app/adhkar/ so translation edits ship without an
 * app rebuild. This loader is cache-first:
 *
 *   1. a bundle already downloaded this session wins (no network);
 *   2. otherwise the AsyncStorage copy is used (works offline);
 *   3. the manifest (per-locale versions) is fetched on first ensure per
 *      session, and a locale is downloaded only when the published
 *      version is newer than the stored one;
 *   4. every failure is fail-open - the caller keeps the English text
 *      seeded in the adhkar SQLite table.
 *
 * The downloaded bundle is handed to dhikrTranslations via
 * setDownloadedDhikrTranslationBundle, so synchronous reads
 * (getDhikrTranslationBundle) see it after one awaited ensure.
 */

import {AppState, type AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import branding from '@/config/branding';
import {
  setDownloadedDhikrTranslationBundle,
  type DhikrTranslationBundle,
} from './dhikrTranslations';

interface ManifestLocale {
  version: number;
  entries: number;
  url: string;
}

interface AdhkarManifest {
  version: number;
  locales: Record<string, ManifestLocale>;
}

interface StoredBundle {
  version: number;
  bundle: DhikrTranslationBundle;
}

const ADHKAR_BASE = `${(
  branding.apiBaseUrl ?? 'https://iapi.istima.app'
).replace(/\/+$/, '')}/adhkar`;
const MANIFEST_URL = `${ADHKAR_BASE}/manifest.json`;
const STORAGE_PREFIX = 'istima:adhkarTranslationBundle:';
const MANIFEST_TIMEOUT_MS = 4000;
const BUNDLE_TIMEOUT_MS = 8000;
const FOREGROUND_DEBOUNCE_MS = 5 * 60 * 1000;

/** Locales whose ensure already ran this session. */
const ensured = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

let manifest: AdhkarManifest | null = null;
let lastRefreshAt = 0;
let stateSubscription: {remove: () => void} | null = null;

/** nl-BE -> nl, matching the fallback rule in dhikrTranslations. */
function baseLocale(locale: string): string {
  return locale.split('-')[0] ?? locale;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {cache: 'no-store', signal: ctrl.signal});
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Minimal shape check: sparse map of id -> {translation?, instruction?}. */
function isBundleShape(x: unknown): x is DhikrTranslationBundle {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  for (const value of Object.values(x)) {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    if (v.translation !== undefined && typeof v.translation !== 'string')
      return false;
    if (v.instruction !== undefined && typeof v.instruction !== 'string')
      return false;
  }
  return true;
}

async function readStored(locale: string): Promise<StoredBundle | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + locale);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredBundle>;
    if (typeof parsed.version !== 'number' || !isBundleShape(parsed.bundle))
      return null;
    return parsed as StoredBundle;
  } catch {
    return null;
  }
}

async function ensureOnce(locale: string): Promise<void> {
  const key = baseLocale(locale);
  if (key === 'en') return; // English is the seeded source text.

  const stored = await readStored(key);
  if (stored) setDownloadedDhikrTranslationBundle(key, stored.bundle);

  const rawManifest = await fetchJson(MANIFEST_URL, MANIFEST_TIMEOUT_MS);
  if (rawManifest && typeof rawManifest === 'object') {
    manifest = rawManifest as AdhkarManifest;
  }
  const entry = manifest?.locales?.[key];
  if (!entry || typeof entry.version !== 'number' || !entry.url) return;
  if (stored && stored.version >= entry.version) return;

  const url = entry.url.startsWith('http')
    ? entry.url
    : `${ADHKAR_BASE.replace(/\/adhkar$/, '')}${entry.url}`;
  const rawBundle = await fetchJson(url, BUNDLE_TIMEOUT_MS);
  if (!isBundleShape(rawBundle)) return;

  setDownloadedDhikrTranslationBundle(key, rawBundle);
  try {
    await AsyncStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({version: entry.version, bundle: rawBundle}),
    );
  } catch {
    // a lost cache write only means a re-download next session
  }
}

/**
 * Ensures the bundle for a locale is as fresh as the published manifest,
 * once per session per locale. Never throws.
 */
export async function ensureDhikrTranslationBundle(
  locale: string,
): Promise<void> {
  const key = baseLocale(locale);
  if (ensured.has(key)) return;
  const pending = inFlight.get(key);
  if (pending) return pending;
  const task = ensureOnce(key)
    .catch(() => {})
    .finally(() => {
      ensured.add(key);
      inFlight.delete(key);
    });
  inFlight.set(key, task);
  return task;
}

/**
 * Cold-start + foreground refresh: re-checks the manifest (debounced) when
 * the app returns to the foreground so a version bump is picked up without
 * waiting for the next cold start. Call once, from AdhkarService.initialize.
 */
export function initDhikrTranslationRefresh(getLocale: () => string): void {
  if (stateSubscription) return;
  stateSubscription = AppState.addEventListener(
    'change',
    (s: AppStateStatus) => {
      if (s !== 'active') return;
      if (Date.now() - lastRefreshAt < FOREGROUND_DEBOUNCE_MS) return;
      lastRefreshAt = Date.now();
      ensured.delete(baseLocale(getLocale()));
      ensureDhikrTranslationBundle(getLocale()).catch(() => {});
    },
  );
}

/** Test hook: reset session state so ensures re-run. */
export function __resetDhikrTranslationLoaderForTests(): void {
  ensured.clear();
  inFlight.clear();
  manifest = null;
  lastRefreshAt = 0;
  stateSubscription?.remove();
  stateSubscription = null;
}
