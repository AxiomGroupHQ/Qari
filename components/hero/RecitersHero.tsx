import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ScrollingHero} from '@/components/hero/ScrollingReciters';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark';
import {HeroSection} from './HeroSection';
import {moderateScale} from 'react-native-size-matters';

/**
 * The main hero component for the RecitersView.
 * Includes the centered ISTIMA wordmark, the reciter collage and RandomRecitationHero with standardized spacing.
 */
export function RecitersHero() {
  return (
    <View>
      <IstimaWordmark />
      <HeroSection
        mainHero={
          <View style={styles.mainHeroWrapper}>
            <ScrollingHero />
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
