import React from 'react';
import {View, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark';
import {ContinueListeningHero} from './ContinueListeningHero';
import {HomeShortcuts} from './HomeShortcuts';

/**
 * Home top region: centered Istima wordmark with both taglines, then the
 * Continue Listening hero (gold glow - the only glow on Home), then the
 * glass shortcut row. The three feature cards no longer sit here; they
 * are interleaved between the content rows below (see homeRowConfig).
 */
export function HomeTop() {
  return (
    <View style={styles.root}>
      <IstimaWordmark />
      <ContinueListeningHero />
      <HomeShortcuts />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: moderateScale(8),
  },
});
