import React, {useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  StatusBar,
  Animated as RNAnimated,
  ListRenderItem,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Feather} from '@expo/vector-icons';
import {moderateScale} from 'react-native-size-matters';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SheetManager} from 'react-native-actions-sheet';
import {useTheme} from '@/hooks/useTheme';
import {USE_GLASS} from '@/hooks/useGlassProps';
import {TrackItem} from '@/components/TrackItem';
import {CollectionStickyHeader} from '@/components/collection/CollectionStickyHeader';
import {useCollectionNativeHeader} from '@/hooks/useCollectionNativeHeader';
import {usePlayerActions} from '@/hooks/usePlayerActions';
import {
  useRecentlyPlayedStore,
  RecentlyPlayedTrack,
} from '@/services/player/store/recentlyPlayedStore';
import {useUploadsStore} from '@/store/uploadsStore';
import {createUserUploadTrack} from '@/utils/track';
import {generateSmartAudioUrl} from '@/utils/audioUtils';
import {getReciterArtwork} from '@/utils/artworkUtils';
import {isFeatureEnabled} from '@/config/featureFlags';
import {shareTrackList} from '@/services/share/shareTrackList';
import {t as translate} from '@/i18n';
import {dirIcon} from '@/i18n/direction';

const buildTrack = (entry: RecentlyPlayedTrack) => {
  if (entry.userRecitationId) {
    const upload = useUploadsStore
      .getState()
      .recitations.find(r => r.id === entry.userRecitationId);
    return upload ? createUserUploadTrack(upload) : null;
  }
  const rewayatId = entry.rewayatId || entry.reciter.rewayat[0]?.id;
  return {
    id: `${entry.reciter.id}:${entry.surah.id}`,
    url: generateSmartAudioUrl(
      entry.reciter,
      entry.surah.id.toString(),
      rewayatId,
    ),
    title: entry.surah.name,
    artist: entry.reciter.name,
    reciterId: entry.reciter.id,
    artwork: getReciterArtwork(entry.reciter),
    surahId: entry.surah.id.toString(),
    reciterName: entry.reciter.name,
    rewayatId,
  };
};

const HistoryScreen = () => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recentTracks = useRecentlyPlayedStore(s => s.recentTracks);
  const clearRecentTracks = useRecentlyPlayedStore(s => s.clearRecentTracks);
  const {updateQueue} = usePlayerActions();
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const title = translate('collection.index.history');

  const handlePlay = useCallback(
    async (index: number) => {
      try {
        const ordered = [
          ...recentTracks.slice(index),
          ...recentTracks.slice(0, index),
        ];
        const tracks = ordered
          .map(buildTrack)
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (tracks.length === 0) return;
        await updateQueue(tracks, 0);
      } catch (error) {
        console.error('Error playing from history:', error);
      }
    },
    [recentTracks, updateQueue],
  );

  const handleClear = useCallback(() => {
    Alert.alert(
      translate('collection.history.clearTitle'),
      translate('collection.history.clearMessage'),
      [
        {text: translate('common.cancel'), style: 'cancel'},
        {
          text: translate('collection.history.clear'),
          style: 'destructive',
          onPress: () => clearRecentTracks(),
        },
      ],
    );
  }, [clearRecentTracks]);

  const handleOptionsMenu = useCallback(() => {
    SheetManager.show('collection-options', {
      payload: {
        title,
        subtitle: `${recentTracks.length}`,
        options: [
          ...(isFeatureEnabled('sharedPlaylists')
            ? [
                {
                  label: translate('sheets.playlistContextSheet.sharePlaylist'),
                  icon: 'share',
                  onPress: () =>
                    shareTrackList(
                      title,
                      recentTracks.map(e => ({
                        surahId: e.surah.id.toString(),
                        reciterId: e.reciter.id,
                        rewayatId: e.rewayatId,
                        userRecitationId: e.userRecitationId,
                      })),
                    ),
                },
              ]
            : []),
          {
            label: translate('collection.history.clear'),
            icon: 'trash-2',
            destructive: true,
            onPress: handleClear,
          },
        ],
      },
    });
  }, [recentTracks, title, handleClear]);

  const renderHeaderRight = useCallback(
    () => (
      <Pressable onPress={handleOptionsMenu} hitSlop={8}>
        <Feather
          name="more-horizontal"
          size={moderateScale(20)}
          color={theme.colors.text}
        />
      </Pressable>
    ),
    [handleOptionsMenu, theme.colors.text],
  );

  useCollectionNativeHeader({
    title,
    scrollY,
    hasContent: recentTracks.length > 0,
    headerRight: recentTracks.length > 0 ? renderHeaderRight : undefined,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {flex: 1, backgroundColor: theme.colors.background},
        list: {flexGrow: 1, paddingBottom: moderateScale(65)},
        listItem: {marginVertical: moderateScale(2)},
        topBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: USE_GLASS ? moderateScale(8) : insets.top,
          paddingBottom: moderateScale(12),
          paddingHorizontal: moderateScale(16),
        },
        iconBox: {
          width: moderateScale(36),
          height: moderateScale(36),
          justifyContent: 'center',
          alignItems: 'center',
        },
        barTitle: {
          flex: 1,
          fontSize: moderateScale(17),
          fontFamily: theme.fonts.bold,
          color: theme.colors.text,
          textAlign: 'center',
        },
        empty: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: moderateScale(32),
          paddingBottom: moderateScale(60),
        },
        emptyTitle: {
          fontSize: moderateScale(17),
          fontFamily: theme.fonts.bold,
          color: theme.colors.text,
          textAlign: 'center',
          marginTop: moderateScale(16),
          marginBottom: moderateScale(8),
        },
        emptySubtitle: {
          fontSize: moderateScale(13),
          fontFamily: theme.fonts.regular,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme, insets.top],
  );

  const topBar = (withMenu: boolean) =>
    USE_GLASS ? null : (
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconBox}
          onPress={() => router.back()}
          hitSlop={8}>
          <Feather
            name={dirIcon('arrow-left')}
            size={moderateScale(22)}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={styles.barTitle}>{title}</Text>
        {withMenu ? (
          <Pressable
            style={styles.iconBox}
            onPress={handleOptionsMenu}
            hitSlop={8}>
            <Feather
              name="more-horizontal"
              size={moderateScale(20)}
              color={theme.colors.text}
            />
          </Pressable>
        ) : (
          <View style={styles.iconBox} />
        )}
      </View>
    );

  if (recentTracks.length === 0) {
    return (
      <View style={styles.container}>
        {topBar(false)}
        <View style={styles.empty}>
          <Feather
            name="clock"
            size={moderateScale(48)}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>
            {translate('collection.history.emptyTitle')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {translate('collection.history.emptySubtitle')}
          </Text>
        </View>
      </View>
    );
  }

  const renderItem: ListRenderItem<RecentlyPlayedTrack> = ({item, index}) => (
    <View style={styles.listItem}>
      <TrackItem
        reciterId={item.reciter.id}
        surahId={item.surah.id.toString()}
        rewayatId={item.rewayatId}
        userRecitationId={item.userRecitationId}
        onPress={() => handlePlay(index)}
        onPlayPress={() => handlePlay(index)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <RNAnimated.FlatList
        data={recentTracks}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          `${item.reciter.id}:${item.surah.id}:${
            item.userRecitationId ?? ''
          }:${index}`
        }
        ListHeaderComponent={topBar(true)}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        onScroll={RNAnimated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
      {!USE_GLASS && <CollectionStickyHeader title={title} scrollY={scrollY} />}
    </View>
  );
};

export default HistoryScreen;
