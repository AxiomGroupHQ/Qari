import type {Reciter, Rewayat} from '@/data/reciterData';
import type {AyahTimestamp} from '@/types/timestamps';

export interface DiscoverClip {
  key: string;
  reciter: Reciter;
  rewayat: Rewayat;
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  startMs: number;
  endMs: number;
}

const MIN_CLIP_MS = 2000;
const MAX_CLIP_MS = 75000;

export interface ClipDeps {
  reciters: Reciter[];
  getTimestamps: (
    rewayatId: string,
    surah: number,
  ) => Promise<AyahTimestamp[] | null>;
  random?: () => number;
}

/** Surahs a rewayat can both play and time. */
export function timedSurahs(rewayat: Rewayat): number[] {
  const available = (rewayat.surah_list ?? []).filter(
    (n): n is number => typeof n === 'number' && n >= 1 && n <= 114,
  );
  const timed = rewayat.timestamps_surah_list;
  if (timed && timed.length > 0) {
    const set = new Set(available.length > 0 ? available : timed);
    return timed.filter(n => set.has(n));
  }
  return available;
}

function pick<T>(list: T[], random: () => number): T {
  return list[Math.min(list.length - 1, Math.floor(random() * list.length))];
}

/**
 * Picks one random ayah from a reciter whose rewayat has per-ayah timings.
 * Returns null when nothing usable is found after a few tries.
 */
export async function pickRandomClip(
  deps: ClipDeps,
  exclude: Set<string> = new Set(),
): Promise<DiscoverClip | null> {
  const random = deps.random ?? Math.random;
  const pool: {reciter: Reciter; rewayat: Rewayat}[] = [];
  for (const reciter of deps.reciters) {
    for (const rewayat of reciter.rewayat) {
      if (rewayat.has_timestamps && timedSurahs(rewayat).length > 0) {
        pool.push({reciter, rewayat});
      }
    }
  }
  if (pool.length === 0) return null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const {reciter, rewayat} = pick(pool, random);
    const surahNumber = pick(timedSurahs(rewayat), random);
    const stamps = await deps.getTimestamps(rewayat.id, surahNumber);
    if (!stamps || stamps.length === 0) continue;
    const usable = stamps.filter(
      s =>
        s.durationMs >= MIN_CLIP_MS &&
        s.durationMs <= MAX_CLIP_MS &&
        s.timestampTo > s.timestampFrom,
    );
    if (usable.length === 0) continue;
    const ayah = pick(usable, random);
    const key = `${rewayat.id}:${surahNumber}:${ayah.ayahNumber}`;
    if (exclude.has(key)) continue;
    return {
      key,
      reciter,
      rewayat,
      surahNumber,
      ayahNumber: ayah.ayahNumber,
      verseKey: `${surahNumber}:${ayah.ayahNumber}`,
      startMs: ayah.timestampFrom,
      endMs: ayah.timestampTo,
    };
  }
  return null;
}
