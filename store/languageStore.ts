import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** "system" follows the device locale; otherwise a supported locale code. */
export type LanguagePreference = 'system' | string;

interface LanguageState {
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      preference: 'system',
      setPreference: preference => set({preference}),
    }),
    {
      name: 'istima-language',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
