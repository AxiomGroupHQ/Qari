import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {useReciterStore} from '@/store/reciterStore';
import {usePlaylistsStore} from '@/store/playlistsStore';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {t} from '@/i18n';
import {
  fetchSharedPlaylist,
  SharedPlaylist,
  SharedPlaylistError,
} from '@/services/share/SharedPlaylistService';
import {buildSharedRows} from '@/services/share/sharedPlaylistTracks';

type LoadState =
  | {status: 'loading'}
  | {status: 'error'; notFound: boolean}
  | {status: 'ready'; playlist: SharedPlaylist};

const SAVED_COLOR = '#4F46E5';

export default function SharedPlaylistScreen(): React.ReactElement {
  const {id} = useLocalSearchParams<{id: string}>();
  const router = useRouter();
  const {theme} = useTheme();
  const isInitialized = useReciterStore(s => s.isInitialized);
  const [state, setState] = useState<LoadState>({status: 'loading'});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setState({status: 'loading'});
    try {
      setState({status: 'ready', playlist: await fetchSharedPlaylist(id)});
    } catch (err) {
      setState({
        status: 'error',
        notFound:
          err instanceof SharedPlaylistError && err.code === 'not_found',
      });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      state.status === 'ready' && isInitialized
        ? buildSharedRows(state.playlist.items)
        : [],
    [state, isInitialized],
  );

  const onPlayAll = useCallback(async () => {
    if (rows.length === 0) return;
    await usePlayerStore.getState().updateQueue(
      rows.map(r => r.track),
      0,
    );
  }, [rows]);

  const onSave = useCallback(async () => {
    if (state.status !== 'ready' || saving) return;
    setSaving(true);
    try {
      const store = usePlaylistsStore.getState();
      const created = await store.createPlaylist(
        state.playlist.name,
        SAVED_COLOR,
      );
      for (const row of rows) {
        await store.addToPlaylist(
          created.id,
          row.item.surahId,
          row.item.reciterId,
          row.item.rewayatId,
        );
      }
      Alert.alert(t('sharedPlaylist.saved'));
    } finally {
      setSaving(false);
    }
  }, [state, rows, saving]);

  const text = theme.colors.text;
  const muted = theme.colors.textSecondary ?? text;

  if (
    state.status === 'loading' ||
    (state.status === 'ready' && !isInitialized)
  ) {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator color={text} />
        <Text style={[styles.muted, {color: muted}]}>
          {t('sharedPlaylist.loading')}
        </Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <Text style={[styles.title, {color: text}]}>
          {t(
            state.notFound ? 'sharedPlaylist.notFound' : 'sharedPlaylist.error',
          )}
        </Text>
        {!state.notFound && (
          <Pressable onPress={load} style={styles.button}>
            <Text style={styles.buttonText}>{t('sharedPlaylist.retry')}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.replace('/')}>
          <Text style={[styles.muted, {color: muted}]}>Istima</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.kicker, {color: muted}]}>
        {t('sharedPlaylist.title')}
      </Text>
      <Text style={[styles.title, {color: text}]}>{state.playlist.name}</Text>
      <Text style={[styles.muted, {color: muted}]}>
        {t('sharedPlaylist.itemCount', {count: rows.length})}
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onPlayAll} style={styles.button}>
          <Text style={styles.buttonText}>{t('sharedPlaylist.play')}</Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          style={styles.buttonOutline}
          disabled={saving}>
          <Text style={[styles.buttonOutlineText, {color: text}]}>
            {t('sharedPlaylist.save')}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={rows}
        keyExtractor={r => r.key}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={[styles.rowTitle, {color: text}]} numberOfLines={1}>
              {item.surahName}
            </Text>
            <Text style={[styles.rowSub, {color: muted}]} numberOfLines={1}>
              {item.reciterName}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, paddingTop: 56},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  kicker: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
    marginTop: 4,
    textAlign: 'center',
  },
  muted: {fontSize: 13, fontFamily: 'Manrope-Medium', marginTop: 4},
  actions: {flexDirection: 'row', gap: 10, marginVertical: 16},
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {color: '#fff', fontFamily: 'Manrope-SemiBold', fontSize: 14},
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#8884',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonOutlineText: {fontFamily: 'Manrope-SemiBold', fontSize: 14},
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8883',
  },
  rowTitle: {fontSize: 15, fontFamily: 'Manrope-SemiBold'},
  rowSub: {fontSize: 12, fontFamily: 'Manrope-Medium', marginTop: 2},
});
