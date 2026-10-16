import React, {useMemo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Reciter} from '@/data/reciterData';
import {Theme} from '@/utils/themeUtils';
import {ReciterImage} from '@/components/ReciterImage';
import {HOME_GOLD} from '@/components/home/homeTheme';

interface CircularBrowseCardProps {
  reciter: Reciter;
  onPress: () => void;
  /** Width of the circular photo; the name sits below it. */
  width: number;
  theme: Theme;
}

function createStyles(theme: Theme, width: number) {
  return StyleSheet.create({
    container: {
      width,
      alignItems: 'center',
    },
    imageContainer: {
      width,
      height: width,
      borderRadius: width / 2,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: Color(HOME_GOLD)
        .alpha(theme.isDarkMode ? 0.45 : 0.35)
        .toString(),
      backgroundColor: Color(theme.colors.text).alpha(0.04).toString(),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    pressed: {
      opacity: 0.75,
    },
    name: {
      marginTop: moderateScale(8),
      fontSize: moderateScale(12),
      fontFamily: 'Manrope-SemiBold',
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: -0.2,
      lineHeight: moderateScale(16),
    },
  });
}

/**
 * Circular photo + name cell for the browse-all reciters grid, in the
 * style of the reference design Zahra picked: calm 3-column circles with
 * the name centered underneath. Press handling stays with the caller so
 * picker flows (surah playback, rewayat preselection) keep working.
 */
export const CircularBrowseCard = React.memo(
  ({reciter, onPress, width, theme}: CircularBrowseCardProps) => {
    const styles = useMemo(() => createStyles(theme, width), [theme, width]);

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={reciter.name}
        style={({pressed}) => [styles.container, pressed && styles.pressed]}>
        <View style={styles.imageContainer}>
          <ReciterImage
            imageUrl={reciter.image_url || undefined}
            reciterName={reciter.name}
            style={styles.image}
            profileIconSize={width * 0.45}
          />
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {reciter.name}
        </Text>
      </Pressable>
    );
  },
  (prevProps, nextProps) =>
    prevProps.reciter === nextProps.reciter &&
    prevProps.width === nextProps.width &&
    prevProps.theme === nextProps.theme,
);

CircularBrowseCard.displayName = 'CircularBrowseCard';
