import React from 'react';
import {Platform, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Color from 'color';

interface GlowBackdropProps {
  /** Glow hue; usually `theme.colors.primary`. */
  color: string;
  /** Overall strength of the glow (0-1]. Defaults to 1. */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Soft gradient glow placed behind a section or card - the cross-platform
 * stand-in for the "shine" of native iOS glass. On web the blob is a real
 * CSS-blurred gradient; on native there is no free blur for arbitrary
 * views, so the gradient's own fade to transparent plus a large border
 * radius approximates the same halo. Purely decorative: absolute
 * positioned, ignores touches, and inherits no layout space.
 */
export function GlowBackdrop({color, intensity = 1, style}: GlowBackdropProps) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        Color(color).alpha(0.5).toString(),
        Color(color).alpha(0).toString(),
      ]}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={[
        styles.glow,
        {opacity: intensity},
        Platform.OS === 'web'
          ? ({filter: 'blur(56px)'} as unknown as ViewStyle)
          : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -48,
    bottom: -48,
    left: -32,
    right: -32,
    borderRadius: 140,
  },
});
