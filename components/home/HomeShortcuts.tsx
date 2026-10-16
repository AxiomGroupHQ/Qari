import React, {useCallback} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ToastAndroid,
  Platform,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import * as Haptics from 'expo-haptics';
import {useTheme} from '@/hooks/useTheme';
import {ShuffleIcon} from '@/components/Icons';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {useRecentlyPlayedStore} from '@/services/player/store/recentlyPlayedStore';
import {getMultipleRandomTracks} from '@/utils/randomRecitation';
import {createTracksForReciter} from '@/utils/track';
import {t} from '@/i18n';
import {HOME_GOLD} from './homeTheme';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

/**
 * Row of small glass shortcut tiles under the Home hero. Currently ships
 * Random only; Khatma / Repetition / Timed Listening tiles land here once
 * Zahra picks between deep-links to existing surfaces and real new features
 * (pending product decision, relayed via main).
 */
export function HomeShortcuts() {
  const {theme} = useTheme();
  const {updateQueue, play} = usePlayerActions();
  const {startNewChain} = useRecentlyPlayedStore();

  // Same random-recitation flow as the old RandomRecitationHero card.
  const handleRandomPlay = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const randomTracks = await getMultipleRandomTracks(15, false);
      if (randomTracks.length === 0) {
        showToast('Failed to find random recitations. Please try again.');
        return;
      }

      const trackPromises = randomTracks.map(item => {
        const availableRewayat = item.reciter.rewayat.filter(r =>
          r.surah_list.includes(item.surah.id),
        );
        const rewayahToUse =
          availableRewayat.length > 0
            ? availableRewayat[
                Math.floor(Math.random() * availableRewayat.length)
              ]
            : item.reciter.rewayat.reduce(
                (prev, current) =>
                  current.surah_total > prev.surah_total ? current : prev,
                item.reciter.rewayat[0],
              );
        return createTracksForReciter(
          item.reciter,
          [item.surah],
          rewayahToUse.id,
        );
      });

      const trackBatches = await Promise.all(trackPromises);
      const tracks = trackBatches.flat();
      await updateQueue(tracks, 0);
      await play();

      const {reciter, surah} = randomTracks[0];
      const firstRewayah =
        randomTracks[0].reciter.rewayat.filter(r =>
          r.surah_list.includes(randomTracks[0].surah.id),
        )[0] || randomTracks[0].reciter.rewayat[0];
      await startNewChain(reciter, surah, 0, 0, firstRewayah.id);
    } catch (error) {
      console.error('Error playing random recitation:', error);
      showToast('Failed to play random recitation. Please try again.');
    }
  }, [updateQueue, play, startNewChain]);

  const shortcuts: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
  }> = [
    {
      id: 'random',
      label: t('recitersView.shortcutRandom'),
      icon: <ShuffleIcon color={HOME_GOLD} size={moderateScale(20)} />,
      onPress: handleRandomPlay,
    },
  ];

  return (
    <View style={styles.row}>
      {shortcuts.map(shortcut => (
        <Pressable
          key={shortcut.id}
          onPress={shortcut.onPress}
          accessibilityRole="button"
          accessibilityLabel={shortcut.label}
          style={({pressed}) => [
            styles.tile,
            {
              backgroundColor: Color(theme.colors.text)
                .alpha(theme.isDarkMode ? 0.05 : 0.04)
                .toString(),
              borderColor: Color(HOME_GOLD)
                .alpha(theme.isDarkMode ? 0.4 : 0.3)
                .toString(),
            },
            pressed && styles.tilePressed,
          ]}>
          {shortcut.icon}
          <Text style={[styles.label, {color: theme.colors.text}]}>
            {shortcut.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(10),
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  tilePressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-SemiBold',
  },
});
