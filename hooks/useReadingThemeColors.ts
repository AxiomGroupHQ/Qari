import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useTheme} from '@/hooks/useTheme';
import {useMushafSettingsStore} from '@/store/mushafSettingsStore';
import {
  getReadingThemeById,
  type ReadingThemeColors,
} from '@/constants/readingThemes';

/**
 * True when the Quran views should use the dark reading themes. Follows the
 * reading mode chosen on the Reading Theme screen; 'app' (the default) follows
 * the app theme.
 */
export function useReadingIsDark(): boolean {
  const {isDarkMode} = useTheme();
  const readingMode = useMushafSettingsStore(s => s.readingMode);
  const systemScheme = useColorScheme();
  if (readingMode === 'app') return isDarkMode;
  if (readingMode === 'system') return systemScheme === 'dark';
  return readingMode === 'dark';
}

/**
 * Returns the active reading theme colors for mushaf/list/player views.
 * Resolves lightThemeId or darkThemeId based on the reading mode.
 */
export function useReadingThemeColors(): ReadingThemeColors {
  const isDarkMode = useReadingIsDark();
  const lightThemeId = useMushafSettingsStore(s => s.lightThemeId);
  const darkThemeId = useMushafSettingsStore(s => s.darkThemeId);

  return useMemo(() => {
    const themeId = isDarkMode ? darkThemeId : lightThemeId;
    const rt = getReadingThemeById(themeId);
    if (rt) return rt.colors;
    // Fallback to defaults if theme not found
    return isDarkMode
      ? getReadingThemeById('dark-default')!.colors
      : getReadingThemeById('default')!.colors;
  }, [isDarkMode, lightThemeId, darkThemeId]);
}
