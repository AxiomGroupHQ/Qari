import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {Image} from 'expo-image';
import {useTheme} from '@/hooks/useTheme';
import {moderateScale} from 'react-native-size-matters';
import {ProfileIcon} from '@/components/Icons';
import {reciterImages} from '@/utils/reciterImages';

interface ReciterImageProps {
  imageUrl?: string;
  reciterName: string;
  style?: StyleProp<ViewStyle>;
  profileIconSize?: number;
  blurRadius?: number;
  /** Use the bundled headshot first when there is one; the remote URL is the fallback. */
  preferLocal?: boolean;
}

export const ReciterImage: React.FC<ReciterImageProps> = React.memo(
  ({
    imageUrl,
    reciterName = '',
    style,
    profileIconSize,
    blurRadius,
    preferLocal,
  }) => {
    const {theme} = useTheme();

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
          image: {
            width: '100%',
            height: '100%',
          },
          squircleMask: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.card,
            borderRadius: moderateScale(12),
          },
        }),
      [theme],
    );

    const formattedName = useMemo(() => {
      if (!reciterName) return '';
      return reciterName.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
    }, [reciterName]);

    const localImageSource = useMemo(() => {
      if (!formattedName) return null;
      return reciterImages[formattedName];
    }, [formattedName]);

    // Prefer the catalog-supplied `imageUrl` over the bundled local headshot.
    // Catalog entries with `image_url` should win so reciters without a bundled
    // asset still render their photo. Local stays as a fallback for reciters
    // whose catalog entry has no image_url.
    // A remote URL that fails to load (stale host saved in history, offline) falls back to the
    // bundled headshot, then to the profile icon, instead of leaving an empty square.
    const [remoteFailed, setRemoteFailed] = useState(false);
    useEffect(() => {
      setRemoteFailed(false);
    }, [imageUrl]);
    const imageSource =
      preferLocal && localImageSource
        ? localImageSource
        : imageUrl && !remoteFailed
        ? {uri: imageUrl}
        : localImageSource ?? null;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.squircleMask} />
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            recyclingKey={
              preferLocal ? formattedName : imageUrl || formattedName
            }
            transition={100}
            onError={() => {
              if (imageUrl) setRemoteFailed(true);
            }}
            {...(blurRadius ? {blurRadius} : {})}
          />
        ) : (
          <ProfileIcon
            color={theme.colors.light}
            size={profileIconSize || moderateScale(20)}
          />
        )}
      </View>
    );
  },
);

ReciterImage.displayName = 'ReciterImage';
