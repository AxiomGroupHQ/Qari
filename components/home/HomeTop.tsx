import React from 'react';
import {View, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark';
import {ContinueListeningHero} from './ContinueListeningHero';
import {HomeShortcuts} from './HomeShortcuts';

/**
 * Redesigned Home top region: slim left-aligned wordmark, the Continue
 * Listening hero (gold glow - the only glow on Home), then the glass
 * shortcut row. Replaces RecitersHero (large centered wordmark + reciter
 * collage + big random-recitation card) as the default listen-tab top.
 */
export function HomeTop() {
  return (
    <View style={styles.root}>
      <View style={styles.wordmark}>
        <IstimaWordmark compact />
      </View>
      <ContinueListeningHero />
      <HomeShortcuts />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: moderateScale(8),
  },
  wordmark: {
    paddingHorizontal: moderateScale(16),
  },
});
