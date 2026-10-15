import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  DevSettings,
  FlatList,
  I18nManager,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import {Dimensions, StyleSheet} from 'react-native';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import {Feather} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import {useTranslation} from 'react-i18next';
import ActionSheet, {SheetManager} from 'react-native-actions-sheet';
import Color from 'color';
import {useTheme} from '@/hooks/useTheme';
import {Theme} from '@/utils/themeUtils';
import {SearchInput} from '@/components/SearchInput';
import {LOCALES, LocaleInfo} from '@/i18n/locales';
import {setLanguagePreference, resolveLocale} from '@/i18n';
import {useLanguageStore} from '@/store/languageStore';

type Row = {id: string; info?: LocaleInfo};

async function reloadApp(): Promise<void> {
  try {
    if (Updates.isEnabled) {
      await Updates.reloadAsync();
      return;
    }
  } catch {
    /* fall through */
  }
  DevSettings.reload();
}

export const LanguageSheet = () => {
  const {t} = useTranslation();
  const {theme} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const preference = useLanguageStore(s => s.preference);
  const [query, setQuery] = useState('');

  const rows: Row[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: Row[] = LOCALES.filter(
      l =>
        !q ||
        l.englishName.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code === q,
    ).map(info => ({id: info.code, info}));
    return q ? list : [{id: 'system'}, ...list];
  }, [query]);

  const onSelect = useCallback(
    async (id: string) => {
      if (id === preference) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const needsReload = await setLanguagePreference(id);
      // Native layout direction only flips after a reload.
      if (needsReload && Platform.OS !== 'web') {
        Alert.alert(t('language.restartTitle'), t('language.restartMessage'), [
          {text: t('language.later'), style: 'cancel'},
          {text: t('language.restartNow'), onPress: () => reloadApp()},
        ]);
      } else if (Platform.OS === 'web') {
        I18nManager.allowRTL(true);
      }
    },
    [preference, t],
  );

  const deviceCode = resolveLocale('system');

  const renderItem = ({item}: {item: Row}) => {
    const selected = item.id === preference;
    const title = item.info ? item.info.nativeName : t('language.system');
    const subtitle = item.info
      ? item.info.englishName
      : (LOCALES.find(l => l.code === deviceCode)?.nativeName ?? '');
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{selected}}
        accessibilityLabel={`${title}, ${subtitle}`}
        style={({pressed}) => [styles.row, pressed && styles.rowPressed]}
        onPress={() => onSelect(item.id)}>
        <View style={styles.rowText}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {selected && (
          <Feather
            name="check"
            size={moderateScale(20)}
            color={theme.colors.text}
          />
        )}
      </Pressable>
    );
  };

  return (
    <ActionSheet
      containerStyle={styles.sheetContainer}
      indicatorStyle={styles.indicator}
      gestureEnabled={true}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>{t('settings.language')}</Text>
        <Pressable
          style={styles.doneButton}
          onPress={() => SheetManager.hide('language-picker')}
          accessibilityRole="button"
          hitSlop={8}>
          <Feather
            name="x"
            size={moderateScale(20)}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
      <View style={styles.searchWrap}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('language.search')}
          showCancelButton={false}
          iconColor={theme.colors.textSecondary}
          textColor={theme.colors.text}
          placeholderTextColor={Color(theme.colors.text).alpha(0.45).toString()}
          backgroundColor={Color(theme.colors.text).alpha(0.06).toString()}
          borderColor={Color(theme.colors.text).alpha(0.12).toString()}
          containerStyle={styles.searchInputContainer}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        style={styles.listFlex}
      />
    </ActionSheet>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    sheetContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      paddingTop: moderateScale(8),
      height: SCREEN_HEIGHT * 0.85,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: Color(theme.colors.text).alpha(0.08).toString(),
    },
    indicator: {
      backgroundColor: Color(theme.colors.text).alpha(0.3).toString(),
      width: moderateScale(40),
      height: 2.5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
    },
    headerSpacer: {width: moderateScale(28)},
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: moderateScale(20),
      fontFamily: 'Manrope-Bold',
      color: theme.colors.text,
    },
    doneButton: {width: moderateScale(28), alignItems: 'flex-end'},
    searchWrap: {paddingHorizontal: '16@s', paddingVertical: '8@vs'},
    searchInputContainer: {paddingHorizontal: 0, paddingVertical: 0},
    listFlex: {flex: 1},
    list: {paddingBottom: '40@vs'},
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: '16@s',
      paddingVertical: '12@vs',
    },
    rowPressed: {opacity: 0.6},
    rowText: {flex: 1},
    title: {
      fontFamily: 'Manrope-SemiBold',
      fontSize: '16@s',
      color: theme.colors.text,
      textAlign: 'auto',
    },
    subtitle: {
      fontFamily: 'Manrope-Regular',
      fontSize: '13@s',
      color: theme.colors.textSecondary,
      marginTop: '2@vs',
      textAlign: 'auto',
    },
  });
