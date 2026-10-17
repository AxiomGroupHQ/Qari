import React, {useCallback} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {Feather} from '@expo/vector-icons';
import {useTheme} from '@/hooks/useTheme';
import {GlowBackdrop} from '@/components/GlowBackdrop';
import {t} from '@/i18n';
import {HOME_GOLD, homeGlassCard, homeGlowIntensity} from './homeTheme';

/**
 * Home "Explore collections" tile (Option A curated Home): a single
 * compact glass tile standing in for the genre rows (Follow Along,
 * Tajweed, Memorization, Rewayah). Routes to the full reciter browser,
 * where those collections live as filters and sections.
 */
export function ExploreCollectionsTile() {
  const {theme} = useTheme();
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push('/(tabs)/(a.home)/browse-all');
  }, [router]);

  return (
    <View style={styles.section}>
      <View style={styles.cardWrapper}>
        <GlowBackdrop color={HOME_GOLD} intensity={homeGlowIntensity(theme)} />
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`${t('homeFeatures.exploreCollectionsTitle')}. ${t('homeFeatures.exploreCollectionsSubtitle')}`}
          style={({pressed}) => [
            styles.card,
            homeGlassCard(theme),
            pressed && styles.pressed,
          ]}>
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: Color(HOME_GOLD)
                  .alpha(theme.isDarkMode ? 0.6 : 0.45)
                  .toString(),
              },
            ]}>
            <Feather name="grid" size={moderateScale(18)} color={HOME_GOLD} />
          </View>
          <View style={styles.titleColumn}>
            <Text style={[styles.title, {color: theme.colors.text}]}>
              {t('homeFeatures.exploreCollectionsTitle')}
            </Text>
            <Text
              style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              {t('homeFeatures.exploreCollectionsSubtitle')}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={moderateScale(18)}
            color={Color(theme.colors.textSecondary).alpha(0.6).toString()}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateScale(28),
  },
  cardWrapper: {
    marginHorizontal: moderateScale(16),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(14),
  },
  iconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: moderateScale(2),
  },
  title: {
    fontSize: moderateScale(15),
    fontFamily: 'Manrope-Bold',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
  pressed: {
    opacity: 0.75,
  },
});
