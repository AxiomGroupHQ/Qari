import React, {useCallback, useMemo, useState} from 'react';
import {View, Text, Pressable, StyleSheet, FlatList} from 'react-native';
import ActionSheet, {
  SheetProps,
  SheetManager,
} from 'react-native-actions-sheet';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Feather} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {SURAHS} from '@/data/surahData';
import {useMushafPlayerStore} from '@/store/mushafPlayerStore';
import {digitalKhattDataService} from '@/services/mushaf/DigitalKhattDataService';
import {t} from '@/i18n';
import {HOME_GOLD} from '@/components/home/homeTheme';

/**
 * Surah + ayah-range picker for the Home Repetition card. Starts real
 * mushaf playback: picks the first timestamp-capable reciter when none is
 * selected yet, sets the range + verse-repeat count on the mushaf player
 * store, navigates to the mushaf page (player bar lives there) and starts
 * playback with synced per-ayah timing.
 */
export const HomeRepetitionSheet = (props: SheetProps<'home-repetition'>) => {
  const {theme} = useTheme();
  const router = useRouter();
  const verseRepeat = props.payload?.verseRepeat ?? 3;

  const [surahId, setSurahId] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(1);
  const [starting, setStarting] = useState(false);

  const surah = useMemo(
    () => SURAHS.find(s => s.id === surahId) ?? SURAHS[0],
    [surahId],
  );
  const totalVerses = surah.verses_count;

  const clampRange = (from: number, to: number, max: number) => {
    const clampedFrom = Math.max(1, Math.min(from, max));
    const clampedTo = Math.max(clampedFrom, Math.min(to, max));
    return [clampedFrom, clampedTo] as const;
  };

  const handleSelectSurah = (id: number) => {
    const max = SURAHS.find(s => s.id === id)?.verses_count ?? 1;
    const [f, to] = clampRange(1, Math.min(7, max), max);
    setSurahId(id);
    setFromAyah(f);
    setToAyah(to);
  };

  const handleStart = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      const store = useMushafPlayerStore.getState();

      // Need a timestamp-capable reciter for synced playback.
      if (!store.rewayatId) {
        await store.computeAvailableReciters();
        const first = useMushafPlayerStore.getState().availableReciters[0];
        if (!first) {
          console.warn('[HomeRepetition] No timestamp-capable reciter found');
          return;
        }
        useMushafPlayerStore
          .getState()
          .setReciter(first.rewayatId, first.reciterName);
      }

      const firstKey = `${surahId}:${fromAyah}`;
      const page =
        digitalKhattDataService.getPageForVerse(firstKey) ||
        useMushafPlayerStore.getState().currentPage ||
        1;

      const s = useMushafPlayerStore.getState();
      s.stop();
      s.setRange(
        {surah: surahId, ayah: fromAyah},
        {surah: surahId, ayah: toAyah},
      );
      s.setVerseRepeatCount(verseRepeat);
      s.setRangeRepeatCount(1);

      await SheetManager.hide('home-repetition');
      router.push({pathname: '/mushaf', params: {surah: String(surahId)}});
      useMushafPlayerStore.getState().startPlayback(page, firstKey);
    } finally {
      setStarting(false);
    }
  }, [starting, surahId, fromAyah, toAyah, verseRepeat, router]);

  const renderSurahRow = ({item}: {item: (typeof SURAHS)[number]}) => {
    const active = item.id === surahId;
    return (
      <Pressable
        onPress={() => handleSelectSurah(item.id)}
        style={({pressed}) => [
          styles.surahRow,
          active && {
            backgroundColor: Color(HOME_GOLD).alpha(0.14).toString(),
          },
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.surahRowText,
            {color: active ? HOME_GOLD : theme.colors.text},
          ]}>
          {item.id}. {item.name}
        </Text>
        {active && (
          <Feather name="check" size={moderateScale(16)} color={HOME_GOLD} />
        )}
      </Pressable>
    );
  };

  const stepper = (
    label: string,
    value: number,
    onChange: (delta: number) => void,
  ) => (
    <View style={styles.stepperBlock}>
      <Text style={[styles.stepperLabel, {color: theme.colors.textSecondary}]}>
        {label}
      </Text>
      <View
        style={[
          styles.stepper,
          {
            backgroundColor: Color(theme.colors.text).alpha(0.06).toString(),
          },
        ]}>
        <Pressable
          onPress={() => onChange(-1)}
          hitSlop={8}
          style={({pressed}) => [
            styles.stepperButton,
            pressed && styles.pressed,
          ]}>
          <Feather
            name="minus"
            size={moderateScale(16)}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={[styles.stepperValue, {color: theme.colors.text}]}>
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(1)}
          hitSlop={8}
          style={({pressed}) => [
            styles.stepperButton,
            pressed && styles.pressed,
          ]}>
          <Feather
            name="plus"
            size={moderateScale(16)}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ActionSheet
      id={props.sheetId}
      containerStyle={[
        styles.sheetContainer,
        {backgroundColor: theme.colors.background},
      ]}
      indicatorStyle={styles.indicator}
      gestureEnabled={true}>
      <View style={styles.container}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          {t('homeFeatures.repetitionTitle')}
        </Text>
        <Text
          style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
          {t('homeFeatures.chooseSurah')}
        </Text>
        <View
          style={[
            styles.surahList,
            {borderColor: Color(theme.colors.text).alpha(0.1).toString()},
          ]}>
          <FlatList
            data={SURAHS}
            renderItem={renderSurahRow}
            keyExtractor={item => String(item.id)}
            initialScrollIndex={Math.max(0, surahId - 2)}
            getItemLayout={(_, index) => ({
              length: moderateScale(40),
              offset: moderateScale(40) * index,
              index,
            })}
            showsVerticalScrollIndicator={true}
          />
        </View>
        <Text
          style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
          {t('homeFeatures.ayahRange')}
        </Text>
        <View style={styles.steppersRow}>
          {stepper(t('common.from'), fromAyah, d =>
            setFromAyah(prev => Math.max(1, Math.min(toAyah, prev + d))),
          )}
          {stepper(t('common.to'), toAyah, d =>
            setToAyah(prev =>
              Math.max(fromAyah, Math.min(totalVerses, prev + d)),
            ),
          )}
        </View>
        <Pressable
          onPress={handleStart}
          disabled={starting}
          accessibilityRole="button"
          style={({pressed}) => [
            styles.startButton,
            {backgroundColor: HOME_GOLD},
            (pressed || starting) && styles.pressed,
          ]}>
          <Text style={[styles.startLabel, {color: '#050b10'}]}>
            {t('homeFeatures.startRepetition')}
          </Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  indicator: {
    backgroundColor: '#888',
  },
  container: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(28),
    gap: moderateScale(10),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-SemiBold',
    marginTop: moderateScale(4),
  },
  surahList: {
    height: moderateScale(200),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    overflow: 'hidden',
  },
  surahRow: {
    height: moderateScale(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
  },
  surahRowText: {
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Medium',
  },
  steppersRow: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  stepperBlock: {
    flex: 1,
    gap: moderateScale(6),
  },
  stepperLabel: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(6),
  },
  stepperButton: {
    padding: moderateScale(8),
  },
  stepperValue: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
  },
  startButton: {
    alignItems: 'center',
    paddingVertical: moderateScale(13),
    borderRadius: moderateScale(24),
    marginTop: moderateScale(6),
  },
  startLabel: {
    fontSize: moderateScale(15),
    fontFamily: 'Manrope-Bold',
  },
  pressed: {
    opacity: 0.8,
  },
});
