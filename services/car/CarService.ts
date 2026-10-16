import {isFeatureEnabled} from '@/config/featureFlags';
import {getAllReciters} from '@/services/dataService';
import {SURAHS} from '@/data/surahData';
import {generateSmartAudioUrl} from '@/utils/audioUtils';
import {getReciterArtwork} from '@/utils/artworkUtils';
import {usePlayerStore} from '@/services/player/store/playerStore';
import type {Reciter} from '@/data/reciterData';

/**
 * Car display support (Apple CarPlay and Android Auto).
 *
 * The screens are drawn by the car, so this file only describes lists and
 * reacts to taps. The native bridge is kept behind CarAdapter. Until the
 * native package and Apple's CarPlay entitlement are in the build,
 * loadCarAdapter() returns null and everything here stays idle.
 * Nothing in this file is imported by the player, and every entry point
 * catches its own errors, so a failure can never reach playback.
 */

export interface CarListItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  onPress: () => void | Promise<void>;
}

export interface CarAdapter {
  onConnect(cb: () => void): void;
  onDisconnect(cb: () => void): void;
  /** Replace the root list shown on the car display. */
  setRootList(title: string, items: CarListItem[]): void;
  /** Push a deeper list (reciter to surahs). */
  pushList(title: string, items: CarListItem[]): void;
  showNowPlaying(): void;
}

export type CarAvailability = 'ready' | 'disabled' | 'not_available_yet';

const MAX_ROOT_ITEMS = 100;

/**
 * Returns the native bridge, or null when it is not part of this build.
 * Wire the native package in here once the entitlement is approved.
 */
export function loadCarAdapter(): CarAdapter | null {
  return null;
}

export function getCarAvailability(
  adapter: CarAdapter | null = loadCarAdapter(),
): CarAvailability {
  if (!isFeatureEnabled('carDisplay')) return 'disabled';
  return adapter ? 'ready' : 'not_available_yet';
}

function surahItems(reciter: Reciter, rewayatId: string): CarListItem[] {
  const rewayat = reciter.rewayat.find(r => r.id === rewayatId);
  return SURAHS.map(surah => ({
    id: `${reciter.id}:${surah.id}`,
    title: surah.name,
    subtitle: reciter.name,
    onPress: async () => {
      const track = {
        id: `${reciter.id}:${surah.id}`,
        url: generateSmartAudioUrl(reciter, String(surah.id), rewayatId),
        title: surah.name,
        artist: reciter.name,
        reciterId: reciter.id,
        artwork: getReciterArtwork(reciter),
        surahId: String(surah.id),
        reciterName: reciter.name,
        rewayatId: rewayat?.id ?? rewayatId,
      };
      await usePlayerStore.getState().updateQueue([track], 0);
    },
  }));
}

export function buildReciterItems(
  reciters: Reciter[],
  adapter: Pick<CarAdapter, 'pushList'>,
): CarListItem[] {
  return reciters
    .filter(r => r.rewayat.length > 0)
    .slice(0, MAX_ROOT_ITEMS)
    .map(reciter => ({
      id: reciter.id,
      title: reciter.name,
      image: getReciterArtwork(reciter),
      onPress: () =>
        adapter.pushList(
          reciter.name,
          surahItems(reciter, reciter.rewayat[0].id),
        ),
    }));
}

let started = false;

/** Safe to call on every launch. Does nothing unless the flag is on and a bridge exists. */
export async function startCarService(
  adapter: CarAdapter | null = loadCarAdapter(),
): Promise<CarAvailability> {
  const availability = getCarAvailability(adapter);
  if (availability !== 'ready' || !adapter || started) return availability;
  started = true;
  try {
    adapter.onConnect(() => {
      getAllReciters()
        .then(reciters =>
          adapter.setRootList('Istima', buildReciterItems(reciters, adapter)),
        )
        .catch(() => {});
    });
    adapter.onDisconnect(() => {
      // Playback keeps running on the phone; nothing to tear down.
    });
  } catch {
    started = false;
    return 'not_available_yet';
  }
  return availability;
}

export function resetCarServiceForTests(): void {
  started = false;
}
