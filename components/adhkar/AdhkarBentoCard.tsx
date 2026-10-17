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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {HOME_GOLD} from '@/components/home/homeTheme';
import {GlassView} from 'expo-glass-effect';
import {USE_GLASS, useGlassColorScheme} from '@/hooks/useGlassProps';

interface AdhkarBentoCardProps {
  category: SuperCategory;
  onPress?: () => void;
  width: number;
  height: number;
  /** Home row only: gold border + a slow premium sheen sweep. */
  goldShimmer?: boolean;
}

// The category name sits on the tile, over the artwork (top-left).
const LABEL_LINE_HEIGHT = moderateScale(16);
const LABEL_FONT_SIZE = moderateScale(13);

/**
 * A soft band of gold light sweeping diagonally across the card every few
 * seconds. Purely decorative (pointerEvents none); the sweep starts and
 * ends fully off-card, so the loop reset is invisible.
 */
function GoldSheen({
  width,
  height,
  isDarkMode,
}: {
  width: number;
  height: number;
  isDarkMode: boolean;
}) {
  const bandWidth = width * 0.7;
  const travel = width + bandWidth * 2;
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
        withDelay(5200, withTiming(0, {duration: 0})),
      ),
      -1,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: -bandWidth + progress.value * travel},
      {rotate: '18deg'},
    ],
  }));

  const shine = isDarkMode
    ? Color(HOME_GOLD).lighten(0.55).alpha(0.34).toString()
    : Color(HOME_GOLD).lighten(0.35).alpha(0.3).toString();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: -height * 0.3,
          bottom: -height * 0.3,
          left: 0,
          width: bandWidth,
        },
        animatedStyle,
      ]}>
      <LinearGradient
        colors={['rgba(0,0,0,0)', shine, 'rgba(0,0,0,0)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export const AdhkarBentoCard = React.memo(function AdhkarBentoCard({
  category,
  width,
  height,
  goldShimmer = false,
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

  const styles = createStyles(theme, width, height, goldShimmer);

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
      {goldShimmer && (
        <GoldSheen width={width} height={height} isDarkMode={isDarkMode} />
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
  goldShimmer: boolean,
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
      borderWidth: goldShimmer ? 1 : 0,
      borderColor: Color(HOME_GOLD)
        .alpha(theme.isDarkMode ? 0.65 : 0.5)
        .toString(),
    },
    glassInner: {
      width,
      height,
      borderRadius: moderateScale(5),
      overflow: 'hidden' as const,
      borderWidth: goldShimmer ? 1 : 0,
      borderColor: Color(HOME_GOLD)
        .alpha(theme.isDarkMode ? 0.65 : 0.5)
        .toString(),
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
