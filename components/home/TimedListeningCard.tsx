import React, {useCallback, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Feather} from '@expo/vector-icons';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

const DURATIONS = [
  {id: '30m', minutes: 30, labelKey: 'homeFeatures.duration30m'},
  {id: '1h', minutes: 60, labelKey: 'homeFeatures.duration1h'},
  {id: '3h', minutes: 180, labelKey: 'homeFeatures.duration3h'},
  {id: '5h', minutes: 300, labelKey: 'homeFeatures.duration5h'},
  {id: '8h', minutes: 480, labelKey: 'homeFeatures.duration8h'},
] as const;

/**
 * Home Timed Listening card: duration chips wired to the player's real
 * sleep timer (playerStore settings.sleepTimer). Tapping the active chip
 * turns the timer off. The timer pauses playback when it expires.
 */
export function TimedListeningCard() {
  const {theme} = useTheme();
  const {updateSettings} = usePlayerActions();
  const activeMinutes = usePlayerStore(state => state.settings.sleepTimer);

  // "Until time" picker state: wall-clock target, minute steps of 15.
  const [untilOpen, setUntilOpen] = useState(false);
  const [untilHour, setUntilHour] = useState(
    () => (new Date().getHours() + 1) % 24,
  );
  const [untilMinute, setUntilMinute] = useState(0);

  const handleSelect = useCallback(
    (minutes: number) => {
      setUntilOpen(false);
      updateSettings({sleepTimer: activeMinutes === minutes ? 0 : minutes});
    },
    [updateSettings, activeMinutes],
  );

  const handleSetUntil = useCallback(() => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(untilHour, untilMinute, 0, 0);
    if (target.getTime() <= now.getTime()) {
      // Time already passed today - aim for tomorrow.
      target.setDate(target.getDate() + 1);
    }
    const minutes = Math.round((target.getTime() - now.getTime()) / 60000);
    if (minutes > 0) {
      updateSettings({sleepTimer: minutes});
      setUntilOpen(false);
    }
  }, [untilHour, untilMinute, updateSettings]);

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, {color: theme.colors.text}]}>
        {t('homeFeatures.timedListening')}
      </Text>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <View style={[styles.card, homeGlassCard(theme)]}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t('homeFeatures.selectDuration')}
          </Text>
          <View style={styles.chipsGrid}>
            {DURATIONS.map(duration => {
              const active = activeMinutes === duration.minutes;
              return (
                <Pressable
                  key={duration.id}
                  onPress={() => handleSelect(duration.minutes)}
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}
                  style={({pressed}) => [
                    styles.chip,
                    {
                      backgroundColor: active
                        ? Color(HOME_GOLD).alpha(0.18).toString()
                        : Color(theme.colors.text).alpha(0.06).toString(),
                      borderColor: active
                        ? Color(HOME_GOLD).alpha(0.7).toString()
                        : Color(theme.colors.text).alpha(0.08).toString(),
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.chipLabel,
                      {color: active ? HOME_GOLD : theme.colors.text},
                    ]}>
                    {t(duration.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setUntilOpen(open => !open)}
              accessibilityRole="button"
              accessibilityState={{selected: untilOpen}}
              style={({pressed}) => [
                styles.chip,
                {
                  backgroundColor: untilOpen
                    ? Color(HOME_GOLD).alpha(0.18).toString()
                    : Color(theme.colors.text).alpha(0.06).toString(),
                  borderColor: untilOpen
                    ? Color(HOME_GOLD).alpha(0.7).toString()
                    : Color(theme.colors.text).alpha(0.08).toString(),
                },
                pressed && styles.pressed,
              ]}>
              <View style={styles.untilChipContent}>
                <Feather
                  name="clock"
                  size={moderateScale(14)}
                  color={untilOpen ? HOME_GOLD : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.chipLabel,
                    {color: untilOpen ? HOME_GOLD : theme.colors.text},
                  ]}>
                  {t('homeFeatures.untilTime')}
                </Text>
              </View>
            </Pressable>
          </View>
          {untilOpen && (
            <View style={styles.untilPicker}>
              <View style={styles.untilSteppers}>
                <View
                  style={[
                    styles.stepper,
                    {
                      backgroundColor: Color(theme.colors.text)
                        .alpha(0.06)
                        .toString(),
                    },
                  ]}>
                  <Pressable
                    onPress={() => setUntilHour(h => (h + 23) % 24)}
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
                  <Text
                    style={[styles.stepperValue, {color: theme.colors.text}]}>
                    {String(untilHour).padStart(2, '0')}
                  </Text>
                  <Pressable
                    onPress={() => setUntilHour(h => (h + 1) % 24)}
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
                <Text style={[styles.untilColon, {color: theme.colors.text}]}>
                  :
                </Text>
                <View
                  style={[
                    styles.stepper,
                    {
                      backgroundColor: Color(theme.colors.text)
                        .alpha(0.06)
                        .toString(),
                    },
                  ]}>
                  <Pressable
                    onPress={() => setUntilMinute(m => (m + 45) % 60)}
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
                  <Text
                    style={[styles.stepperValue, {color: theme.colors.text}]}>
                    {String(untilMinute).padStart(2, '0')}
                  </Text>
                  <Pressable
                    onPress={() => setUntilMinute(m => (m + 15) % 60)}
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
              <Pressable
                onPress={handleSetUntil}
                accessibilityRole="button"
                style={({pressed}) => [
                  styles.setButton,
                  {backgroundColor: HOME_GOLD},
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.setButtonLabel}>
                  {t('homeFeatures.setTimer')}
                </Text>
              </Pressable>
            </View>
          )}
          {activeMinutes > 0 && (
            <Text
              style={[styles.activeNote, {color: theme.colors.textSecondary}]}>
              {t('homeFeatures.timerActiveNote')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateScale(28),
  },
  heading: {
    fontSize: moderateScale(22),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.5,
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(10),
  },
  cardWrapper: {
    marginHorizontal: moderateScale(16),
  },
  card: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(18),
    gap: moderateScale(12),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.3,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
  },
  chip: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-SemiBold',
  },
  activeNote: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  untilChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  untilPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(12),
  },
  untilSteppers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(2),
  },
  stepperButton: {
    padding: moderateScale(8),
  },
  stepperValue: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
    minWidth: moderateScale(28),
    textAlign: 'center',
  },
  untilColon: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
  },
  setButton: {
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
  },
  setButtonLabel: {
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Bold',
    color: '#050b10',
  },
  pressed: {
    opacity: 0.8,
  },
});
