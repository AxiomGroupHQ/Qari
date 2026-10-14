import React from 'react';
import {View, StyleSheet} from 'react-native';
import {BrowseAllHero} from '@/components/hero/BrowseAllHero';
import {HeroSection} from './HeroSection';
import {moderateScale} from 'react-native-size-matters';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark'; // @ai

/**
 * The main hero component for the RecitersView.
 * Includes BrowseAllHero and RandomRecitationHero with standardized spacing.
 */
export function RecitersHero() {
  return (
    <View>
      <IstimaWordmark />
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
