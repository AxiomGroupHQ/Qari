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
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import {useHeaderHeight} from '@react-navigation/elements';
import {Feather} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@/hooks/useTheme';
import {USE_GLASS} from '@/hooks/useGlassProps';
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

export default function LanguageScreen() {
  const {t} = useTranslation();
  const {theme} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const preference = useLanguageStore(s => s.preference);
  const [query, setQuery] = useState('');
  const rawHeaderHeight = useHeaderHeight();
  const headerHeight = USE_GLASS ? rawHeaderHeight : 0;

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
    <View style={[styles.container, {paddingTop: headerHeight}]}>
      <View style={styles.searchWrap}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('language.search')}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background},
    searchWrap: {paddingHorizontal: '16@s', paddingVertical: '8@vs'},
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
