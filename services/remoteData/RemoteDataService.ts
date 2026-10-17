/**
 * Remote reference data.
 *
 * Large, read-only reference JSON (Quran text, translations, tafseer,
 * word-by-word, transliteration, surah metadata) is served from
 * https://iapi.istima.app/data/ instead of the app binary, so content
 * updates ship without an app rebuild and the binary stays small.
 *
 * Cache-first, offline after first download:
 *   1. files live on disk (native: documentDirectory/remote-data/,
 *      web: Cache Storage) once downloaded;
 *   2. /data-manifest.json carries per-file versions and sha256 - a file
 *      is re-downloaded only when the published version is newer;
 *   3. cold start works fully offline from the disk copy;
 *   4. fail-open: a failed manifest fetch or download never throws out of
 *      initRemoteData; paths that could not be loaded are reported so
 *      the caller can retry on the next cold start.
 *
 * Consumers read parsed data synchronously via getRemoteJson AFTER
 * initRemoteData has run (AppInitializer), exactly like the require()
 * calls this replaces.
 */

import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import branding from '@/config/branding';

export interface RemoteDataManifest {
  version: number;
  updatedAt?: string;
  files: Record<string, {version: number; bytes: number; sha256: string}>;
}

const API_BASE = (branding.apiBaseUrl ?? 'https://iapi.istima.app').replace(
  /\/+$/,
  '',
);
const DATA_BASE = `${API_BASE}/data`;
const MANIFEST_URL = `${API_BASE}/data-manifest.json`;
const VERSIONS_KEY = 'istima:remoteData:versions';
const MANIFEST_TIMEOUT_MS = 5000;
const DOWNLOAD_TIMEOUT_MS = 60000;
const WEB_CACHE_NAME = 'istima-remote-data';

const memory = new Map<string, unknown>();
let versions: Record<string, number> = {};
let initialized = false;

function isWeb(): boolean {
  return Platform.OS === 'web';
}

async function sha256Hex(
  input: string | ArrayBuffer,
): Promise<string> {
  if (isWeb() && typeof crypto !== 'undefined' && crypto.subtle) {
    const buf =
      typeof input === 'string' ? new TextEncoder().encode(input) : input;
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input as string,
  );
}

function localPath(path: string): string {
  return `${FileSystem.documentDirectory}remote-data/${path}`;
}

async function readCached(path: string): Promise<string | null> {
  try {
    if (isWeb()) {
      const cache = await caches.open(WEB_CACHE_NAME);
      const res = await cache.match(`${DATA_BASE}/${path}`);
      return res ? await res.text() : null;
    }
    const info = await FileSystem.getInfoAsync(localPath(path));
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(localPath(path));
  } catch {
    return null;
  }
}

async function writeCached(path: string, contents: string): Promise<void> {
  if (isWeb()) {
    const cache = await caches.open(WEB_CACHE_NAME);
    await cache.put(
      `${DATA_BASE}/${path}`,
      new Response(contents, {headers: {'Content-Type': 'application/json'}}),
    );
    return;
  }
  const target = localPath(path);
  const dir = target.slice(0, target.lastIndexOf('/'));
  await FileSystem.makeDirectoryAsync(dir, {intermediates: true}).catch(
    () => {},
  );
  await FileSystem.writeAsStringAsync(target, contents);
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response | null> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {cache: 'no-store', signal: ctrl.signal});
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadVersions(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(VERSIONS_KEY);
    versions = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    versions = {};
  }
}

async function saveVersions(): Promise<void> {
  try {
    await AsyncStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch {
    // a lost write only means a re-download next session
  }
}

export interface RemoteDataInitResult {
  /** Paths ready to read via getRemoteJson. */
  ready: string[];
  /** Paths that could not be loaded (no cache + download failed). */
  missing: string[];
}

/**
 * Ensures every required path is downloaded, current, and parsed in
 * memory. Never throws.
 */
export async function initRemoteData(
  requiredPaths: string[],
): Promise<RemoteDataInitResult> {
  const ready: string[] = [];
  const missing: string[] = [];
  // Fully loaded this session: no manifest fetch, no disk reads.
  if (requiredPaths.every(p => memory.has(p))) {
    return {ready: [...requiredPaths], missing: []};
  }
  await loadVersions();

  const manifestRes = await fetchWithTimeout(
    MANIFEST_URL,
    MANIFEST_TIMEOUT_MS,
  );
  const manifest = manifestRes
    ? ((await manifestRes.json().catch(() => null)) as RemoteDataManifest | null)
    : null;

  for (const path of requiredPaths) {
    if (memory.has(path)) {
      ready.push(path);
      continue;
    }
    try {
      const published = manifest?.files?.[`/data/${path}`];
      const cached = await readCached(path);
      const current =
        cached !== null &&
        (!published || (versions[path] ?? 0) >= published.version);

      let text = current ? cached : null;
      if (text === null) {
        const res = await fetchWithTimeout(
          `${DATA_BASE}/${path}`,
          DOWNLOAD_TIMEOUT_MS,
        );
        if (res) {
          const downloaded = await res.text();
          // Integrity check when the manifest pins a hash.
          if (published?.sha256) {
            const actual = await sha256Hex(downloaded);
            if (actual !== published.sha256) {
              missing.push(path);
              continue;
            }
          }
          await writeCached(path, downloaded);
          versions[path] = published?.version ?? versions[path] ?? 1;
          text = downloaded;
        } else if (cached !== null) {
          // Download failed but a stale cache exists: use it, fail open.
          text = cached;
        }
      }

      if (text === null) {
        missing.push(path);
        continue;
      }
      memory.set(path, path.endsWith('.txt') ? text : JSON.parse(text));
      ready.push(path);
    } catch {
      missing.push(path);
    }
  }

  await saveVersions();
  initialized = true;
  return {ready, missing};
}

/**
 * Synchronous read after initRemoteData. Returns `fallback` when the path
 * was never loaded, so a missing download degrades a feature instead of
 * crashing the app.
 */
export function getRemoteJson<T>(path: string, fallback: T): T {
  const value = memory.get(path);
  return value === undefined ? fallback : (value as T);
}

export function isRemoteDataReady(path: string): boolean {
  return memory.has(path);
}

export function __resetRemoteDataForTests(): void {
  memory.clear();
  versions = {};
  initialized = false;
}

export {MANIFEST_URL as REMOTE_DATA_MANIFEST_URL, DATA_BASE as REMOTE_DATA_BASE};
void initialized;
