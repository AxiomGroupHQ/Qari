import {SURAHS} from '@/data/surahData';
import {getReciterByIdSync} from '@/services/dataService';
import {generateSmartAudioUrl} from '@/utils/audioUtils';
import {getReciterArtwork} from '@/utils/artworkUtils';
import type {SharedItem} from './SharedPlaylistService';

export interface SharedRow {
  key: string;
  item: SharedItem;
  surahName: string;
  reciterName: string;
  track: {
    id: string;
    url: string;
    title: string;
    artist: string;
    reciterId: string;
    artwork: ReturnType<typeof getReciterArtwork>;
    surahId: string;
    reciterName: string;
    rewayatId: string;
  };
}

/** Turns shared items into playable rows. Items whose reciter is not in the catalog are skipped. */
export function buildSharedRows(items: SharedItem[]): SharedRow[] {
  const rows: SharedRow[] = [];
  items.forEach((item, index) => {
    const reciter = getReciterByIdSync(item.reciterId);
    if (!reciter) return;
    const rewayat =
      (item.rewayatId && reciter.rewayat.find(r => r.id === item.rewayatId)) ||
      reciter.rewayat[0];
    if (!rewayat) return;
    const surahNum = parseInt(item.surahId, 10);
    const surah = SURAHS.find(s => s.id === surahNum);
    if (!surah) return;
    rows.push({
      key: `${index}:${item.reciterId}:${item.surahId}`,
      item,
      surahName: surah.name,
      reciterName: reciter.name,
      track: {
        id: `${reciter.id}:${surahNum}`,
        url: generateSmartAudioUrl(reciter, String(surahNum), rewayat.id),
        title: surah.name,
        artist: reciter.name,
        reciterId: reciter.id,
        artwork: getReciterArtwork(reciter),
        surahId: String(surahNum),
        reciterName: reciter.name,
        rewayatId: rewayat.id,
      },
    });
  });
  return rows;
}
