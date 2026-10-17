import React, {useCallback, useMemo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {ReciterImage} from '@/components/ReciterImage';
import {PlayIcon, ShuffleIcon} from '@/components/Icons';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {useRecentlyPlayedStore} from '@/services/player/store/recentlyPlayedStore';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {shallow} from 'zustand/shallow';
import {
  getReciterById,
  getSurahById,
  getAvailableSurahsForRewayat,
} from '@/services/dataService';
import {createTracksForReciter} from '@/utils/track';
import {generateSmartAudioUrl} from '@/utils/audioUtils';
import {getReciterArtwork} from '@/utils/artworkUtils';
import {getReciterByIdSync} from '@/services/dataService';
import {Surah} from '@/data/surahData';
import {t} from '@/i18n';
import {HOME_GOLD} from './homeTheme';

/**
 * Home hero: one-tap resume of the most recent recitation (surah + reciter,
 * progress bar), with a soft gold glow behind it - the only glow on Home.
 * With no listening history it falls back to a "Start listening" card that
 * routes to browse-all. Upload entries are skipped: their resume flow lives
 * on the recents row cards.
 */
export function ContinueListeningHero() {
  const {theme} = useTheme();
  const router = useRouter();
  const {recentTracks} = useRecentlyPlayedStore();
  const {updateQueue} = usePlayerActions();
  const {currentIndex, tracks, storePosition, storeDuration} = usePlayerStore(
    state => ({
      currentIndex: state.queue.currentIndex,
      tracks: state.queue.tracks,
      storePosition: state.playback.position,
      storeDuration: state.playback.duration,
    }),
    shallow,
  );

  // First recent entry with intact catalog data (uploads excluded - their
  // resume path needs the uploads store and stays on the recents cards).
  const heroIndex = useMemo(
    () =>
      recentTracks.findIndex(
        track =>
          !track.isUserUpload &&
          track.reciter?.id &&
          track.reciter?.name &&
          track.surah?.id &&
          track.surah?.name,
      ),
    [recentTracks],
  );
  const track = heroIndex >= 0 ? recentTracks[heroIndex] : null;

  // Match the active player track the same way RecentReciterCard does:
  // reciter + surah + rewayat identity, regardless of play/pause state.
  const isCurrentlyPlaying = useMemo(() => {
    if (!track) return false;
    const currentTrack =
      tracks && currentIndex >= 0 && currentIndex < tracks.length
        ? tracks[currentIndex]
        : null;
    if (!currentTrack) return false;
    const rewayatMatches =
      track.rewayatId && currentTrack.rewayatId
        ? track.rewayatId === currentTrack.rewayatId
        : !track.rewayatId && !currentTrack.rewayatId;
    return (
      currentTrack.reciterId === track.reciter.id &&
      currentTrack.surahId === track.surah.id.toString() &&
      rewayatMatches
    );
  }, [track, tracks, currentIndex]);

  const progress = track
    ? isCurrentlyPlaying && storeDuration > 0
      ? storePosition / storeDuration
      : track.progress
    : 0;

  // One-tap resume - same queue logic as RecentReciterCard.
  const handleResume = useCallback(async () => {
    if (!track) return;
    try {
      const [reciter, surah] = await Promise.all([
        getReciterById(track.reciter.id),
        getSurahById(track.surah.id),
      ]);
      if (!reciter || !surah) return;

      const rewayatToUseId = track.rewayatId || reciter.rewayat[0]?.id;
      if (!rewayatToUseId) return;

      const startPosition =
        isCurrentlyPlaying && storePosition >= 0
          ? storePosition
          : track.progress * track.duration;

      const availableSurahIds = await getAvailableSurahsForRewayat(
        rewayatToUseId,
      );
      const allSurahsForRewayat = availableSurahIds
        .map(id => getSurahById(id))
        .filter((s): s is Surah => s !== undefined);

      const startIndex = allSurahsForRewayat.findIndex(
        s => s.id === track.surah.id,
      );

      if (startIndex === -1 || allSurahsForRewayat.length === 0) {
        const fallback = await createTracksForReciter(
          reciter,
          [surah],
          rewayatToUseId,
        );
        if (!fallback || fallback.length === 0) return;
        await updateQueue(fallback, 0, startPosition);
        useRecentlyPlayedStore.getState().resumeChain(heroIndex);
        return;
      }

      const artwork = getReciterArtwork(reciter);
      const reorderedSurahs = [
        allSurahsForRewayat[startIndex],
        ...allSurahsForRewayat.slice(startIndex + 1),
        ...allSurahsForRewayat.slice(0, startIndex),
      ];
      const allTracks = reorderedSurahs.map(s => ({
        id: `${reciter.id}:${s.id}`,
        url: generateSmartAudioUrl(reciter, s.id.toString(), rewayatToUseId),
        title: s.name,
        artist: reciter.name,
        reciterId: reciter.id,
        artwork,
        surahId: s.id.toString(),
        reciterName: reciter.name,
        rewayatId: rewayatToUseId,
      }));

      await updateQueue(allTracks, 0, startPosition);
      useRecentlyPlayedStore.getState().resumeChain(heroIndex);
    } catch (error) {
      console.error('[ContinueListeningHero] Resume failed:', error);
    }
  }, [track, isCurrentlyPlaying, storePosition, updateQueue, heroIndex]);

  const goldBorder = Color(HOME_GOLD)
    .alpha(theme.isDarkMode ? 0.45 : 0.35)
    .toString();

  if (!track) {
    return (
      <View style={styles.wrapper}>
        <GlowBackdrop
          color={HOME_GOLD}
          intensity={theme.isDarkMode ? 0.2 : 0.1}
        />
        <Pressable
          onPress={() => router.push('/(tabs)/(a.home)/browse-all')}
          accessibilityRole="button"
          accessibilityLabel={t('recitersView.startListening')}
          style={({pressed}) => [
            styles.card,
            {
              backgroundColor: Color(theme.colors.text)
                .alpha(theme.isDarkMode ? 0.05 : 0.04)
                .toString(),
              borderColor: goldBorder,
            },
            pressed && styles.pressed,
          ]}>
          <View style={[styles.iconCircle, {borderColor: goldBorder}]}>
            <ShuffleIcon color={HOME_GOLD} size={moderateScale(20)} />
          </View>
          <View style={styles.textColumn}>
            <Text style={[styles.eyebrow, {color: HOME_GOLD}]}>
              {t('recitersView.startListening')}
            </Text>
            <Text style={[styles.title, {color: theme.colors.text}]}>
              {t('recitersView.startListeningTitle')}
            </Text>
            <Text
              style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              {t('recitersView.startListeningSubtitle')}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  const imageUrl =
    getReciterByIdSync(track.reciter.id)?.image_url ||
    track.reciter.image_url ||
    undefined;

  return (
    <View style={styles.wrapper}>
      <GlowBackdrop
        color={HOME_GOLD}
        intensity={theme.isDarkMode ? 0.2 : 0.1}
      />
      <Pressable
        onPress={handleResume}
        accessibilityRole="button"
        accessibilityLabel={`${t('recitersView.continueListening')}: ${
          track.surah.name
        } - ${track.reciter.name}`}
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: Color(theme.colors.text)
              .alpha(theme.isDarkMode ? 0.05 : 0.04)
              .toString(),
            borderColor: goldBorder,
          },
          pressed && styles.pressed,
        ]}>
        <ReciterImage
          imageUrl={imageUrl}
          reciterName={track.reciter.name}
          style={styles.reciterImage}
          profileIconSize={moderateScale(26)}
        />
        <View style={styles.textColumn}>
          <Text style={[styles.eyebrow, {color: HOME_GOLD}]}>
            {t('recitersView.continueListening')}
          </Text>
          <Text
            style={[styles.title, {color: theme.colors.text}]}
            numberOfLines={1}>
            {track.surah.name}
          </Text>
          <Text
            style={[styles.subtitle, {color: theme.colors.textSecondary}]}
            numberOfLines={1}>
            {track.reciter.name}
          </Text>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: Color(theme.colors.text)
                  .alpha(0.12)
                  .toString(),
              },
            ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                  backgroundColor: HOME_GOLD,
                },
              ]}
            />
          </View>
        </View>
        <View style={[styles.playCircle, {backgroundColor: HOME_GOLD}]}>
          <PlayIcon color={theme.colors.background} size={moderateScale(18)} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(14),
    gap: moderateScale(12),
  },
  pressed: {
    opacity: 0.8,
  },
  reciterImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
  },
  iconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    gap: moderateScale(2),
  },
  eyebrow: {
    fontSize: moderateScale(10),
    fontFamily: 'Manrope-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: moderateScale(17),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  progressTrack: {
    height: moderateScale(3),
    borderRadius: moderateScale(2),
    marginTop: moderateScale(6),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(2),
  },
  playCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
