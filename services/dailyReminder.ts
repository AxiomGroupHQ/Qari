import {Platform} from 'react-native';
import {SURAHS} from '@/data/surahData';
import {t} from '@/i18n';
import {isFeatureEnabled} from '@/config/featureFlags';

const REMINDER_HOUR = 9;
const DAYS_AHEAD = 14;

const supported = () =>
  Platform.OS !== 'web' && isFeatureEnabled('dailyReminder');

/** Same rule as the Surah of the Day card on the home screen. */
export function surahForDate(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
  );
  return SURAHS[dayOfYear % 114];
}

const load = () => import('expo-notifications');

export async function cancelDailyReminders(): Promise<void> {
  if (!supported()) return;
  try {
    const N = await load();
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // nothing scheduled, or the module is unavailable
  }
}

/**
 * Schedules the next two weeks of morning notifications, one per day, each
 * naming that day's surah. Safe to call on every launch: it replaces the old
 * batch. Does nothing without permission.
 */
export async function scheduleDailyReminders(): Promise<boolean> {
  if (!supported()) return false;
  try {
    const N = await load();
    const perm = await N.getPermissionsAsync();
    if (perm.status !== 'granted') return false;
    await N.cancelAllScheduledNotificationsAsync();
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('daily-reminder', {
        name: t('dailyReminder.title'),
        importance: N.AndroidImportance.DEFAULT,
      });
    }
    const now = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const when = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + i,
        REMINDER_HOUR,
        0,
        0,
      );
      if (when.getTime() <= now.getTime() + 60_000) continue;
      await N.scheduleNotificationAsync({
        content: {
          title: t('dailyReminder.title'),
          body: t('dailyReminder.body', {name: surahForDate(when).name}),
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: 'daily-reminder',
        },
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Asks the OS for permission (the system dialog is the consent) and, if
 * granted, schedules. Returns whether the reminder is now on.
 */
export async function enableDailyReminders(): Promise<boolean> {
  if (!supported()) return false;
  try {
    const N = await load();
    let {status} = await N.getPermissionsAsync();
    if (status !== 'granted') {
      ({status} = await N.requestPermissionsAsync());
    }
    if (status !== 'granted') return false;
    return await scheduleDailyReminders();
  } catch {
    return false;
  }
}
