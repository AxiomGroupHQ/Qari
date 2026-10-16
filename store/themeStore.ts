import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeMode, PrimaryColor, Theme, createTheme} from '@/utils/themeUtils';
import {Appearance, Platform} from 'react-native';

interface ThemeState {
  themeMode: ThemeMode;
  primaryColor: PrimaryColor;
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
}

/**
 * Sync native UI (keyboard, alerts, glass chrome) with the chosen mode. react-native-web's Appearance
 * has no setColorScheme, so calling it there threw and the theme never changed (Light/Dark looked
 * disabled). On web we only set the CSS color-scheme instead.
 */
const syncNativeColorScheme = (mode: ThemeMode) => {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme =
        mode === 'system' ? '' : mode;
    }
    return;
  }
  try {
    if (mode === 'system') {
      // Android's AppearanceModule.setColorScheme crashes on null, so skip it there.
      if (Platform.OS !== 'android') Appearance.setColorScheme(null as any);
    } else {
      Appearance.setColorScheme(mode);
    }
  } catch {
    /* never block a theme change on native chrome sync */
  }
};

const getEffectiveTheme = (
  mode: ThemeMode,
  primaryColor: PrimaryColor,
): Theme => {
  const systemTheme = Appearance.getColorScheme();

  if (mode === 'system') {
    const effectiveTheme = systemTheme === 'dark' ? 'dark' : 'light';
    return createTheme(effectiveTheme, primaryColor);
  }
  return createTheme(mode, primaryColor);
};

// Subscribe to system theme changes outside of the store
Appearance.addChangeListener(({colorScheme}) => {
  const state = useThemeStore.getState();

  if (state.themeMode === 'system') {
    const effectiveTheme = colorScheme === 'dark' ? 'dark' : 'light';
    const newTheme = createTheme(effectiveTheme, state.primaryColor);
    useThemeStore.setState({theme: newTheme});
  }
});

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      themeMode: 'dark',
      primaryColor: 'Blue',
      theme: getEffectiveTheme('dark', 'Blue'),

      setThemeMode: mode =>
        set(state => {
          const newTheme = getEffectiveTheme(mode, state.primaryColor);
          syncNativeColorScheme(mode);
          return {
            themeMode: mode,
            theme: newTheme,
          };
        }),

      setPrimaryColor: color =>
        set(state => {
          const newTheme = getEffectiveTheme(state.themeMode, color);
          return {
            primaryColor: color,
            theme: newTheme,
          };
        }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        themeMode: state.themeMode,
        primaryColor: state.primaryColor,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          const theme = getEffectiveTheme(state.themeMode, state.primaryColor);
          syncNativeColorScheme(state.themeMode);
          useThemeStore.setState({
            ...state,
            theme,
          });
        }
      },
    },
  ),
);
