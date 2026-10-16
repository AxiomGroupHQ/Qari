import type {Reciter} from '@/data/reciterData';
import type {DownloadedSurah} from '@/services/player/store/downloadStore';

/**
 * The live reciter when available, otherwise a minimal one built from the data saved with the
 * download, so offline downloads never disappear when the reciter list is missing.
 */
export function reciterForDownload(
  download: DownloadedSurah,
  loaded: Reciter | null | undefined,
): Reciter | null {
  if (loaded) return loaded;
  if (!download.reciterName) return null;
  return {
    id: download.reciterId,
    name: download.reciterName,
    date: null,
    image_url: download.reciterImageUrl ?? null,
    rewayat: [],
  };
}
