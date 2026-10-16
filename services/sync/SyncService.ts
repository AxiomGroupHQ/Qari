import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {syncApi, AuthError} from '@/services/auth/AuthClient';
import {useAuthStore} from '@/store/authStore';
import {useThemeStore} from '@/store/themeStore';
import {useMushafSettingsStore} from '@/store/mushafSettingsStore';
import {useAdhkarSettingsStore} from '@/store/adhkarSettingsStore';
import {usePlayCountStore} from '@/store/playCountStore';
import {useFavoriteRecitersStore} from '@/store/favoriteRecitersStore';
import {RECITERS} from '@/data/reciterData';
import {Platform} from 'react-native';
import {useSettings} from '@/hooks/useSettings';
import {useTafseerStore} from '@/store/tafseerStore';
import {useReciterStore} from '@/store/reciterStore';
import {useMushafPlayerStore} from '@/store/mushafPlayerStore';
import {usePlaylistsStore} from '@/store/playlistsStore';
import {useVerseAnnotationsStore} from '@/store/verseAnnotationsStore';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {useLovedStore} from '@/services/player/store/lovedStore';
import {useRecentlyPlayedStore} from '@/services/player/store/recentlyPlayedStore';
import {useFavoriteRecitersStore as usePlayerFavoriteRecitersStore} from '@/services/player/store/favoriteRecitersStore';
import {localAggregationStore} from '@/services/analytics/LocalAggregationStore';
import {databaseService} from '@/services/database/DatabaseService';
import type {PlaylistItem} from '@/services/database/DatabaseService';
import {verseAnnotationDatabaseService} from '@/services/database/VerseAnnotationDatabaseService';
import {adhkarDatabaseService} from '@/services/database/AdhkarDatabaseService';

/**
 * Account sync. Each document is a small JSON snapshot of some AsyncStorage keys, so the server
 * stays at a few rows per user. Language is deliberately NOT synced (it is a per-device choice).
 *
 * Rules: the first time a document is seen on a device the server copy wins (so a new device picks
 * up the account's data); after that, local edits are pushed (debounced) and a pull never
 * overwrites unsynced local edits.
 */
type DocKey =
  | 'settings'
  | 'favorites'
  | 'playcounts'
  | 'playlists'
  | 'annotations'
  | 'adhkar'
  | 'position'
  | 'library'
  | 'goals';

type Snapshot = Record<string, string | null>;

interface DocDef {
  read: () => Promise<Snapshot>;
  write: (snap: Snapshot) => Promise<void>;
  /** True when local data does not survive a reload on this platform (web in-memory stores). The
   * server copy then always wins on the first sync of a session. */
  volatile?: boolean;
}

/** A document that is a set of AsyncStorage keys, re-read into their stores after a pull. */
const kvDoc = (
  keys: string[],
  rehydrate: () => Promise<void> | void,
): DocDef => ({
  read: async () => {
    const out: Snapshot = {};
    for (const key of keys) out[key] = await AsyncStorage.getItem(key);
    return out;
  },
  write: async snap => {
    for (const key of keys) {
      const v = snap?.[key];
      if (typeof v === 'string') await AsyncStorage.setItem(key, v);
      else if (v === null) await AsyncStorage.removeItem(key);
    }
    await rehydrate();
  },
});

const sortBy = <T>(arr: T[], key: (x: T) => string) =>
  [...arr].sort((x, y) => key(x).localeCompare(key(y)));

const isWeb = Platform.OS === 'web';

const SETTINGS_KV = kvDoc(
  [
    'theme-storage',
    'mushaf-settings',
    'adhkar-settings',
    'settings-storage',
    'tafseer-store',
    'reciter-storage',
  ],
  async () => {
    await Promise.all([
      useThemeStore.persist.rehydrate(),
      useMushafSettingsStore.persist.rehydrate(),
      useAdhkarSettingsStore.persist.rehydrate(),
      useSettings.persist.rehydrate(),
      useTafseerStore.persist.rehydrate(),
      useReciterStore.persist.rehydrate(),
    ]);
  },
);

const pulledThisSession = new Set<DocKey>();

const DOCS: Record<DocKey, DocDef> = {
  // Appearance, mushaf, adhkar, reading, tafseer and default reciter settings.
  settings: {
    read: async () => {
      const out = await SETTINGS_KV.read();
      const {sleepTimerInterval: _omit, ...playback} = usePlayerStore.getState()
        .settings as unknown as Record<string, unknown>;
      out['player.settings'] = JSON.stringify(playback);
      return out;
    },
    write: async snap => {
      await SETTINGS_KV.write(snap);
      const raw = snap?.['player.settings'];
      if (typeof raw === 'string') {
        const remote = JSON.parse(raw);
        usePlayerStore.setState(st => ({
          settings: {...st.settings, ...remote},
        }));
      }
    },
  },
  playcounts: kvDoc(['play-count-storage'], () =>
    usePlayCountStore.persist.rehydrate(),
  ),
  favorites: kvDoc(
    [
      'favoriteReciters',
      'favoriteRecitersTimestamps',
      'player-favorite-reciters-storage',
    ],
    async () => {
      const [ids, ts] = await Promise.all([
        AsyncStorage.getItem('favoriteReciters'),
        AsyncStorage.getItem('favoriteRecitersTimestamps'),
      ]);
      const favIds: string[] = ids ? JSON.parse(ids) : [];
      const stamps: Record<string, number> = ts ? JSON.parse(ts) : {};
      useFavoriteRecitersStore.setState({
        favoriteReciters: RECITERS.filter(r => favIds.includes(r.id)).map(
          r => ({...r, favoritedAt: stamps[r.id] || Date.now()}),
        ),
      });
      await usePlayerFavoriteRecitersStore.persist.rehydrate();
    },
  ),
  // Loved tracks and recently played.
  library: kvDoc(
    ['loved-tracks-store', 'player-recently-played-storage'],
    async () => {
      await Promise.all([
        useLovedStore.persist.rehydrate(),
        useRecentlyPlayedStore.persist.rehydrate(),
      ]);
    },
  ),
  // Mushaf reading position. The audio resume point (last track) is NOT synced: track objects
  // hold device specific URLs and downloaded file paths.
  position: kvDoc(['mushaf-player-store'], () =>
    useMushafPlayerStore.persist.rehydrate(),
  ),
  // Daily listening goal and khatmah (full recitation) progress.
  goals: {
    read: async () => ({
      goal: JSON.stringify(localAggregationStore.getListeningGoal()),
      khatmah: JSON.stringify(localAggregationStore.getKhatmahProgress()),
    }),
    write: async snap => {
      if (typeof snap?.goal === 'string')
        localAggregationStore.setListeningGoal(JSON.parse(snap.goal));
      if (typeof snap?.khatmah === 'string') {
        const k = JSON.parse(snap.khatmah);
        if (k) localAggregationStore.saveKhatmahProgress(k);
      }
    },
  },
  playlists: {
    volatile: isWeb,
    read: async () => {
      await databaseService.initialize();
      const lists = sortBy(await databaseService.getAllPlaylists(), p => p.id);
      const out = [];
      for (const p of lists) {
        const items = (await databaseService.getPlaylistItems(p.id))
          // Uploaded recitations are files on this device only.
          .filter(i => !i.userRecitationId)
          .map(
            ({
              id,
              playlistId,
              surahId,
              reciterId,
              rewayatId,
              orderIndex,
              addedAt,
            }) => ({
              id,
              playlistId,
              surahId,
              reciterId,
              rewayatId,
              orderIndex,
              addedAt,
            }),
          );
        const {itemCount: _c, ...rest} = p;
        out.push({...rest, items: sortBy(items, i => i.id)});
      }
      return {data: JSON.stringify(out)};
    },
    write: async snap => {
      await databaseService.initialize();
      for (const p of await databaseService.getAllPlaylists())
        await databaseService.deletePlaylist(p.id);
      const lists = JSON.parse(snap?.data ?? '[]') as Array<
        Record<string, unknown> & {items: PlaylistItem[]}
      >;
      for (const {items, ...p} of lists) {
        await databaseService.createPlaylist(p as never);
        for (const it of items) await databaseService.addPlaylistItem(it);
      }
      await usePlaylistsStore.getState().loadPlaylists();
    },
  },
  annotations: {
    volatile: isWeb,
    read: async () => {
      const svc = verseAnnotationDatabaseService;
      await svc.initialize();
      const highlights = [];
      for (let n = 1; n <= 114; n++)
        highlights.push(...(await svc.getHighlightsBySurah(n)));
      const strip = <T extends {id: string; createdAt: number}>(x: T) => x;
      return {
        data: JSON.stringify({
          bookmarks: sortBy(
            (await svc.getAllBookmarks()).map(strip),
            x => x.verseKey,
          ),
          notes: sortBy((await svc.getAllNotes()).map(strip), x => x.id),
          highlights: sortBy(highlights.map(strip), x => x.verseKey),
        }),
      };
    },
    write: async snap => {
      const svc = verseAnnotationDatabaseService;
      await svc.initialize();
      for (const b of await svc.getAllBookmarks())
        await svc.removeBookmark(b.verseKey);
      for (const n of await svc.getAllNotes()) await svc.deleteNoteById(n.id);
      for (let n = 1; n <= 114; n++)
        for (const h of await svc.getHighlightsBySurah(n))
          await svc.removeHighlight(h.verseKey);
      const d = JSON.parse(snap?.data ?? '{}');
      for (const b of d.bookmarks ?? [])
        await svc.addBookmark(
          b.verseKey,
          b.surahNumber,
          b.ayahNumber,
          b.rewayahId,
        );
      for (const n of d.notes ?? [])
        await svc.addNote(
          n.verseKey,
          n.surahNumber,
          n.ayahNumber,
          n.content,
          n.verseKeys,
          n.rewayahId,
        );
      for (const h of d.highlights ?? [])
        await svc.upsertHighlight(
          h.verseKey,
          h.surahNumber,
          h.ayahNumber,
          h.color,
          h.rewayahId,
        );
      useVerseAnnotationsStore.setState({loadedSurah: null});
    },
  },
  // Saved adhkar (the ids only). Tasbeeh counters reset daily, so they stay on the device.
  adhkar: {
    read: async () => {
      await adhkarDatabaseService.initialize();
      const saved = (await adhkarDatabaseService.getSaved()).map(
        x => x.dhikrId,
      );
      return {data: JSON.stringify(saved.sort())};
    },
    write: async snap => {
      await adhkarDatabaseService.initialize();
      const want = new Set<string>(JSON.parse(snap?.data ?? '[]'));
      const have = new Set(
        (await adhkarDatabaseService.getSaved()).map(x => x.dhikrId),
      );
      for (const id of have)
        if (!want.has(id)) await adhkarDatabaseService.toggleSaved(id);
      for (const id of want)
        if (!have.has(id)) await adhkarDatabaseService.toggleSaved(id);
    },
  },
};

const META = (k: DocKey) => `istima.sync.meta.${k}`;
interface Meta {
  hash: string; // hash of the last snapshot known to match the server
  pulledAt: number; // server updatedAt we last applied/pushed
}

const snapshot = (k: DocKey): Promise<Snapshot> => DOCS[k].read();
const hashOf = (s: Snapshot): string => {
  const text = JSON.stringify(s);
  let h = 5381;
  for (let i = 0; i < text.length; i++)
    h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${text.length}:${h}`;
};
const readMeta = async (k: DocKey): Promise<Meta | null> => {
  const raw = await AsyncStorage.getItem(META(k));
  return raw ? (JSON.parse(raw) as Meta) : null;
};
const writeMeta = (k: DocKey, m: Meta) =>
  AsyncStorage.setItem(META(k), JSON.stringify(m));

let running = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

async function applyRemote(k: DocKey, value: unknown) {
  await DOCS[k].write(value as Snapshot);
}

let lastRun = 0;
const MIN_GAP_MS = 60_000;

export async function syncNow(force = true): Promise<void> {
  const token = useAuthStore.getState().token;
  if (!token || running) return;
  // Change-triggered syncs are throttled so busy stores (reading position) stay far below the
  // free-tier request limits. Sign-in and foreground syncs always run.
  if (!force && Date.now() - lastRun < MIN_GAP_MS) return;
  lastRun = Date.now();
  running = true;
  try {
    const {docs} = await syncApi.pull(token, 0);
    const remote = new Map(docs.map(d => [d.key, d]));
    for (const k of Object.keys(DOCS) as DocKey[]) {
      const local = await snapshot(k);
      const localHash = hashOf(local);
      const meta = await readMeta(k);
      const r = remote.get(k);
      const unsyncedLocal = !!meta && meta.hash !== localHash;

      const forceRemote =
        !!r && !!DOCS[k].volatile && !pulledThisSession.has(k);
      if (
        r &&
        (forceRemote ||
          !meta ||
          (r.updatedAt > meta.pulledAt && !unsyncedLocal))
      ) {
        await applyRemote(k, r.value);
        await writeMeta(k, {
          hash: hashOf(await snapshot(k)),
          pulledAt: r.updatedAt,
        });
        pulledThisSession.add(k);
      } else if (!r || unsyncedLocal) {
        const res = await syncApi.push(token, k, local);
        await writeMeta(k, {hash: localHash, pulledAt: res.updatedAt});
        pulledThisSession.add(k);
      }
    }
  } catch (e) {
    if (e instanceof AuthError && e.code === 'unauthorized') {
      await useAuthStore.getState().signOut();
    }
    // Network errors are fine: we retry on the next trigger.
  } finally {
    running = false;
  }
}

function schedulePush() {
  if (!useAuthStore.getState().token) return;
  if (pushTimer) clearTimeout(pushTimer);
  // Debounced so a burst of changes is one write (the D1 free tier allows 100k writes/day).
  pushTimer = setTimeout(() => void syncNow(false), 15000);
}

let started = false;
/** Call once at app start. Syncs on sign-in, when the app returns to the foreground, and after local changes. */
export function startSync(): void {
  if (started) return;
  started = true;
  let prevToken = useAuthStore.getState().token;
  useAuthStore.subscribe(s => {
    if (s.token && s.token !== prevToken) void syncNow();
    prevToken = s.token;
  });
  AppState.addEventListener('change', st => {
    if (st === 'active') void syncNow();
  });
  [
    useThemeStore,
    useMushafSettingsStore,
    useAdhkarSettingsStore,
    useSettings,
    useTafseerStore,
    useReciterStore,
    usePlayCountStore,
    useFavoriteRecitersStore,
    usePlayerFavoriteRecitersStore,
    useLovedStore,
    useRecentlyPlayedStore,
    useMushafPlayerStore,
    usePlaylistsStore,
    useVerseAnnotationsStore,
  ].forEach(store => store.subscribe(schedulePush));
  // The player store changes constantly during playback, so only its settings object counts.
  let prevPlayerSettings = usePlayerStore.getState().settings;
  usePlayerStore.subscribe(st => {
    if (st.settings === prevPlayerSettings) return;
    prevPlayerSettings = st.settings;
    schedulePush();
  });
  if (useAuthStore.getState().token) void syncNow();
}
