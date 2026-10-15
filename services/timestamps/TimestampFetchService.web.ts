// @ai-generated
import {RECITERS} from '@/data/reciterData';
import type {AyahTimestamp} from '@/types/timestamps';
import {parseMp3QuranTimings} from './parseMp3QuranTimings';

const {
  timestampFetchService: mirrored,
}: typeof import('./TimestampFetchService') = require('./TimestampFetchService.ts');
const findRewayat = (id: string) =>
  RECITERS.flatMap(reciter => reciter.rewayat).find(
    rewayat => rewayat.id === id,
  );

// The bundled catalog predates the mirror's has_timestamps flags. Its explicit
// MP3Quran read IDs still identify matching audio/timing sources. Keep native
// mirror behavior and use the public timing API for these browser reciters.
export const timestampFetchService = {
  hasSource(id: string): boolean {
    return mirrored.hasSource(id) || Boolean(findRewayat(id)?.mp3quran_read_id);
  },
  hasSurah(id: string, surah: number): boolean {
    const rewayat = findRewayat(id);
    return (
      mirrored.hasSurah(id, surah) ||
      Boolean(rewayat?.mp3quran_read_id && rewayat.surah_list.includes(surah))
    );
  },
  async fetchAndCache(
    id: string,
    surah: number,
  ): Promise<AyahTimestamp[] | null> {
    if (mirrored.hasSurah(id, surah)) {
      const cached = await mirrored.fetchAndCache(id, surah);
      if (cached) return cached;
    }
    const rewayat = findRewayat(id);
    if (!rewayat?.mp3quran_read_id || !rewayat.surah_list.includes(surah))
      return null;
    try {
      const response = await fetch(
        `https://mp3quran.net/api/v3/ayat_timing?read=${rewayat.mp3quran_read_id}&surah=${surah}`,
        {signal: AbortSignal.timeout(15000)},
      );
      if (!response.ok) return null;
      // TimestampService retains successful results in its in-memory cache.
      return parseMp3QuranTimings(await response.json(), surah);
    } catch {
      return null;
    }
  },
};
