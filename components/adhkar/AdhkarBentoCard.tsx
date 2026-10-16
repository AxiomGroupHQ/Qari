import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Image} from 'expo-image';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {SuperCategory} from '@/types/adhkar';
import {ADHKAR_CATEGORY_IMAGES} from '@/constants/adhkarImages';
import {Link} from 'expo-router';
import {GlassView} from 'expo-glass-effect';
import {USE_GLASS, useGlassColorScheme} from '@/hooks/useGlassProps';

interface AdhkarBentoCardProps {
  category: SuperCategory;
  onPress?: () => void;
  width: number;
  height: number;
}

// The category name sits on the tile, over the artwork (top-left).
const LABEL_LINE_HEIGHT = moderateScale(16);
const LABEL_FONT_SIZE = moderateScale(13);

export const AdhkarBentoCard = React.memo(function AdhkarBentoCard({
  category,
  width,
  height,
}: AdhkarBentoCardProps) {
  const {theme} = useTheme();
  const glassColorScheme = useGlassColorScheme();
  const isDarkMode = theme.isDarkMode;

  // Subtle gradient incorporating the category's color (same pattern as ExploreView)
  const baseColor = Color(category.color);
  const gradientColors = [
    baseColor.alpha(0.15).toString(),
    baseColor.alpha(0.25).toString(),
  ] as const;

  const styles = createStyles(theme, width, height);

  const imageSet = ADHKAR_CATEGORY_IMAGES[category.id];

  const label = (
    <Text style={styles.title} numberOfLines={2}>
      {category.title}
    </Text>
  );

  const cardContent = (
    <>
      {imageSet ? (
        <Image
          source={isDarkMode ? imageSet.dark : imageSet.light}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      )}
      {label}
    </>
  );

  const linkProps = {
    href: {
      pathname: '/(tabs)/(e.adhkar)/adhkar/[superId]' as const,
      params: {superId: category.id},
    },
    asChild: true as const,
  };

  if (USE_GLASS) {
    return (
      <Link {...linkProps}>
        <Pressable style={styles.wrapper}>
          <Link.AppleZoom>
            <GlassView
              style={styles.glassInner}
              glassEffectStyle="regular"
              colorScheme={glassColorScheme}>
              {cardContent}
            </GlassView>
          </Link.AppleZoom>
        </Pressable>
      </Link>
    );
  }

  return (
    <Link {...linkProps}>
      <Pressable style={styles.wrapper}>
        <View style={styles.container}>{cardContent}</View>
      </Pressable>
    </Link>
  );
});

const createStyles = (
  theme: ReturnType<typeof useTheme>['theme'],
  width: number,
  height: number,
) =>
  StyleSheet.create({
    wrapper: {
      width,
    },
    container: {
      width,
      height,
      borderRadius: moderateScale(5),
      overflow: 'hidden',
    },
    glassInner: {
      width,
      height,
      borderRadius: moderateScale(5),
      overflow: 'hidden' as const,
    },
    title: {
      position: 'absolute',
      top: moderateScale(8),
      start: moderateScale(10),
      end: moderateScale(10),
      fontSize: LABEL_FONT_SIZE,
      fontFamily: 'Manrope-SemiBold',
      color: theme.isDarkMode ? '#ffffff' : '#1a1a2e',
      lineHeight: LABEL_LINE_HEIGHT,
      textAlign: 'auto',
      ...(theme.isDarkMode
        ? {
            textShadowColor: 'rgba(0,0,0,0.55)',
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 3,
          }
        : {}),
    },
  });

export default AdhkarBentoCard;
