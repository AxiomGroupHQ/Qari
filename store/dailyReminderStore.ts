import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyReminderState {
  /** Only true after the user agreed and the OS granted permission. */
  enabled: boolean;
  /** The one-time offer has been shown (accepted or declined). */
  offered: boolean;
  launches: number;
  setEnabled: (enabled: boolean) => void;
  markOffered: () => void;
  countLaunch: () => void;
}

export const useDailyReminderStore = create<DailyReminderState>()(
  persist(
    set => ({
      enabled: false,
      offered: false,
      launches: 0,
      setEnabled: enabled => set({enabled}),
      markOffered: () => set({offered: true}),
      countLaunch: () => set(s => ({launches: s.launches + 1})),
    }),
    {
      name: 'daily-reminder-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
