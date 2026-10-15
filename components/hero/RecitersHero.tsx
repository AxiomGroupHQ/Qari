import React from 'react';
import {View, StyleSheet} from 'react-native';
import {BrowseAllHero} from '@/components/hero/BrowseAllHero';
import {HeroSection} from './HeroSection';
import {moderateScale} from 'react-native-size-matters';

/**
 * The main hero component for the RecitersView.
 * Includes BrowseAllHero and RandomRecitationHero with standardized spacing.
 *
 * The Home screen intentionally omits the compact/header ISTIMA wordmark here.
 * The centered branded block is rendered elsewhere and the wordmark remains
 * available on other screens that use it.
 */
export function RecitersHero() {
  return (
    <View>
      <HeroSection
        mainHero={
          <View style={styles.mainHeroWrapper}>
            <BrowseAllHero />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainHeroWrapper: {
    paddingHorizontal: moderateScale(16),
  },
});
