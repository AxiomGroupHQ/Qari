import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import {Image} from 'expo-image';
import {useRouter} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {t} from '@/i18n';
import {getAllReciters} from '@/services/dataService';
import {timestampService} from '@/services/timestamps/TimestampService';
import {generateSmartAudioUrl} from '@/utils/audioUtils';
import {getReciterArtwork} from '@/utils/artworkUtils';
import {getTranslationText} from '@/utils/translationLookup';
import {useMushafSettingsStore} from '@/store/mushafSettingsStore';
import {useNetworkStore} from '@/store/networkStore';
import {SURAHS} from '@/data/surahData';
import {
  pickRandomClip,
  type DiscoverClip,
} from '@/services/discover/discoverClips';
import {discoverAudioService} from '@/services/discover/DiscoverAudioService';
import {getRemoteJson} from '@/services/remoteData/RemoteDataService';

const quranData = getRemoteJson(
  'quran.json',
  {} as Record<string, {text_uthmani: string}>,
);
const arabicByKey: Record<string, string> = {};
for (const v of Object.values(quranData)) arabicByKey[v.verse_key] = v.text;

const BATCH = 3;

export default function DiscoverScreen(): React.ReactElement {
  const {theme} = useTheme();
  const router = useRouter();
  const {height} = useWindowDimensions();
  const translationId = useMushafSettingsStore(s => s.selectedTranslationId);
  const [clips, setClips] = useState<DiscoverClip[]>([]);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const loading = useRef(false);
  const seen = useRef(new Set<string>());

  const loadMore = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const reciters = await getAllReciters();
      const next: DiscoverClip[] = [];
      for (let i = 0; i < BATCH; i++) {
        const clip = await pickRandomClip(
          {
            reciters,
            getTimestamps: (id, surah) =>
              timestampService.getTimestampsForSurah(id, surah),
          },
          seen.current,
        );
        if (clip) {
          seen.current.add(clip.key);
          next.push(clip);
        }
      }
      if (next.length === 0 && clips.length === 0) setFailed(true);
      setClips(prev => [...prev, ...next]);
    } catch {
      setFailed(true);
    } finally {
      loading.current = false;
    }
  }, [clips.length]);

  // When the connection comes back after a failed load, try again by itself.
  const isOnline = useNetworkStore(st => st.isOnline);
  const wasOnline = useRef(isOnline);
  useEffect(() => {
    if (isOnline && !wasOnline.current && failed && clips.length === 0) {
      setFailed(false);
      loadMore();
    }
    wasOnline.current = isOnline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useEffect(() => {
    loadMore();
    return () => discoverAudioService.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const clip = clips[active];
    if (!clip) return;
    setPaused(false);
    discoverAudioService.playClip(
      generateSmartAudioUrl(
        clip.reciter,
        String(clip.surahNumber),
        clip.rewayat.id,
      ),
      clip.startMs,
      clip.endMs,
    );
    if (active >= clips.length - 2) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, clips[active]?.key]);

  const onViewable = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    const first = viewableItems.find(v => v.isViewable);
    if (first?.index != null) setActive(first.index);
  }).current;

  const togglePause = useCallback(() => {
    if (paused) {
      discoverAudioService.resume();
    } else {
      discoverAudioService.pause();
    }
    setPaused(p => !p);
  }, [paused]);

  const text = theme.colors.text;
  const muted = theme.colors.textSecondary;

  const renderItem = useMemo(
    () =>
      function Card({item}: {item: DiscoverClip}) {
        const surah = SURAHS.find(s => s.id === item.surahNumber);
        return (
          <Pressable
            onPress={togglePause}
            style={[
              styles.card,
              {height, backgroundColor: theme.colors.background},
            ]}>
            <Image
              source={getReciterArtwork(item.reciter)}
              style={styles.artwork}
              contentFit="cover"
            />
            <Text style={[styles.reciter, {color: text}]}>
              {item.reciter.name}
            </Text>
            <Text style={[styles.meta, {color: muted}]}>
              {surah?.name} {item.verseKey}
            </Text>
            <Text style={[styles.arabic, {color: text}]}>
              {arabicByKey[item.verseKey] ?? ''}
            </Text>
            <Text style={[styles.translation, {color: muted}]}>
              {getTranslationText(item.verseKey, translationId)}
            </Text>
          </Pressable>
        );
      },
    [height, theme, text, muted, translationId, togglePause],
  );

  if (failed && clips.length === 0) {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <Text style={[styles.reciter, {color: text}]}>
          {t('discover.empty')}
        </Text>
        <Pressable
          onPress={() => {
            setFailed(false);
            loadMore();
          }}>
          <Text style={[styles.meta, {color: muted}]}>
            {t('discover.retry')}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (clips.length === 0) {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator color={text} />
        <Text style={[styles.meta, {color: muted}]}>
          {t('discover.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={clips}
        keyExtractor={c => c.key}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{itemVisiblePercentThreshold: 80}}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
      <Pressable
        style={styles.close}
        onPress={() => router.back()}
        hitSlop={12}>
        <Text style={[styles.meta, {color: text}]}>{t('discover.close')}</Text>
      </Pressable>
      {paused && (
        <Text style={[styles.paused, {color: muted}]}>
          {t('discover.paused')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  card: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  artwork: {width: 96, height: 96, borderRadius: 48},
  reciter: {fontSize: 20, fontFamily: 'Manrope-Bold', textAlign: 'center'},
  meta: {fontSize: 13, fontFamily: 'Manrope-Medium'},
  arabic: {
    fontSize: 28,
    lineHeight: 52,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 12,
  },
  translation: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
  },
  close: {position: 'absolute', top: 56, right: 20},
  paused: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    fontSize: 13,
  },
});
