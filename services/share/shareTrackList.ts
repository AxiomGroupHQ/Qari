import {Alert} from 'react-native';
import {t} from '@/i18n';
import {playlistShareUrl, shareUrl} from '@/utils/shareUtils';
import {
  createSharedPlaylist,
  SharedPlaylistError,
  SharedItem,
} from './SharedPlaylistService';

interface TrackLike {
  surahId: string;
  reciterId: string;
  rewayatId?: string;
  userRecitationId?: string;
}

/** Shares a list of tracks (for example Loved) as a /p/<id> link. User uploads
 *  live only on this device, so they are left out. Same alerts as playlists. */
export async function shareTrackList(
  name: string,
  tracks: TrackLike[],
): Promise<void> {
  try {
    const items: SharedItem[] = tracks
      .filter(tr => !tr.userRecitationId)
      .map(tr => ({
        surahId: tr.surahId,
        reciterId: tr.reciterId,
        ...(tr.rewayatId ? {rewayatId: tr.rewayatId} : {}),
      }));
    const id = await createSharedPlaylist(name, items);
    await shareUrl(
      playlistShareUrl(id),
      t('sheets.playlistContextSheet.shareMessage', {name}),
    );
  } catch (err) {
    const code = err instanceof SharedPlaylistError ? err.code : 'network';
    Alert.alert(
      t('sheets.playlistContextSheet.sharePlaylist'),
      t(
        code === 'empty'
          ? 'sheets.playlistContextSheet.shareNothing'
          : code === 'rate_limited'
            ? 'sheets.playlistContextSheet.shareRateLimited'
            : 'sheets.playlistContextSheet.shareFailed',
      ),
    );
  }
}
