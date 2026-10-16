import Color from 'color';
import {Theme} from '@/utils/themeUtils';

/**
 * Shared accents for the redesigned Home top region. The gold matches the
 * Istima wordmark rule (`#9a7b3c` in components/branding/IstimaWordmark.tsx)
 * so the thin accents read as one brand in both dark (near-black) and light
 * (ivory/sand) schemes.
 */
export const HOME_GOLD = '#9a7b3c';

/** Glass card surface + hairline gold border shared by the Home hero,
 * shortcut tiles and the Khatma / Repetition / Timed Listening feature
 * cards. */
export function homeGlassCard(theme: Theme) {
  return {
    backgroundColor: Color(theme.colors.text)
      .alpha(theme.isDarkMode ? 0.05 : 0.04)
      .toString(),
    borderColor: Color(HOME_GOLD)
      .alpha(theme.isDarkMode ? 0.45 : 0.35)
      .toString(),
  };
}

/** Gold intensity for the soft glow behind a Home card. */
export function homeGlowIntensity(theme: Theme) {
  return theme.isDarkMode ? 0.18 : 0.1;
}
