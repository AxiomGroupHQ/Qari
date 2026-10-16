import React, {useMemo} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {Theme} from '@/utils/themeUtils';
import {useAdhkarPlayAllStore} from '@/store/adhkarPlayAllStore';
import {t} from '@/i18n';

/**
 * Previous, play/pause, next and stop for Play All. Sits outside the scrolling
 * text so long Arabic can never push it off screen.
 */
export const PlayAllBar: React.FC = React.memo(function PlayAllBar() {
  const {theme} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPlaying = useAdhkarPlayAllStore(s => s.isPlaying);
  const toggle = useAdhkarPlayAllStore(s => s.toggle);
  const next = useAdhkarPlayAllStore(s => s.advanceToNext);
  const prev = useAdhkarPlayAllStore(s => s.goToPrevious);
  const stop = useAdhkarPlayAllStore(s => s.stopPlayAll);

  const btn = (
    name: React.ComponentProps<typeof Feather>['name'],
    label: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Feather name={name} size={moderateScale(22)} color={theme.colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.bar}>
      {btn('square', t('adhkarUi.playAllStop'), stop)}
      {btn('skip-back', t('adhkarUi.playAllPrevious'), () => {
        prev();
      })}
      {btn(
        isPlaying ? 'pause' : 'play',
        isPlaying ? t('adhkarUi.pauseAll') : t('adhkarUi.playAllLabel'),
        toggle,
      )}
      {btn('skip-forward', t('adhkarUi.playAllNext'), () => {
        next();
      })}
    </View>
  );
});

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    bar: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: moderateScale(10),
      marginHorizontal: moderateScale(16),
      marginBottom: moderateScale(8),
      borderRadius: moderateScale(16),
      backgroundColor: Color(theme.colors.textSecondary).alpha(0.1).toString(),
    },
    button: {
      width: moderateScale(48),
      height: moderateScale(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
