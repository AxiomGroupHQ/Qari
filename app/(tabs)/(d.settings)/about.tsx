// @ai-generated
import React, {useMemo} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useTheme} from '@/hooks/useTheme';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import {Theme} from '@/utils/themeUtils';
import Color from 'color';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark'; // @ai
import {VersionDisplay} from '@/components/VersionDisplay';
import {t} from '@/i18n';

interface FeatureProps {
  title: string;
  description: string;
  styles: ReturnType<typeof createStyles>;
}

const Feature = ({title, description, styles}: FeatureProps) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

export default function AboutScreen() {
  const {theme} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.logoContainer}>
            <IstimaWordmark />
          </View>

          <VersionDisplay style={styles.version} />

          <Text style={styles.tagline}>
            {t('settings.about.listenReflectRememberAllah')}
          </Text>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>Alhamdulillah</Text>
            <Text style={styles.bodyText}>
              All praise is due to Allah. ISTIMA, استماع, is a place to listen,
              reflect, and strengthen your connection with the Quran. Built for
              the Ummah by Halalweb, it brings Quran recitation, reading, and
              learning together in one calm space.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>
              {t('settings.about.ourMission')}
            </Text>
            <Text style={styles.bodyText}>
              {t('settings.about.quranBayanTafsirKnowledgeOur')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {t('settings.about.features')}
            </Text>
            <View style={styles.featureList}>
              <Feature
                title={t('settings.about.offlineDownloads')}
                description={t(
                  'settings.about.downloadSurahsForOfflineListening',
                )}
                styles={styles}
              />
              <Feature
                title={t('settings.about.customPlaylists')}
                description={t('settings.about.createAndManageYourOwn')}
                styles={styles}
              />
              <Feature
                title={t('settings.about.browseByJuz')}
                description={t('settings.about.easilyNavigateThroughTheQuran')}
                styles={styles}
              />
              <Feature
                title={t('settings.about.advancedAudioControls')}
                description={t(
                  'settings.about.precisePlaybackControlWithContinuous',
                )}
                styles={styles}
              />
              <Feature
                title={t('settings.about.highQualityAudio')}
                description={t('settings.about.crystalClearRecitationsFromThe')}
                styles={styles}
              />
              <Feature
                title={t('settings.about.curatedCollections')}
                description={t(
                  'settings.about.thoughtfullyOrganizedSurahsForDifferent',
                )}
                styles={styles}
              />
              <Feature
                title={t('settings.about.personalization')}
                description={t('settings.about.customizeThemesAccentColorsAnd')}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>
              {t('settings.about.readListenAndReflect')}
            </Text>
            <Text style={styles.bodyText}>
              {t('settings.about.readTheMushafExploreTranslations')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>
              {t('settings.about.ourCommitment')}
            </Text>
            <Text style={styles.bodyText}>
              {t('settings.about.weCareAboutTheAccuracy')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: moderateScale(24),
      paddingVertical: moderateScale(20),
      paddingBottom: moderateScale(160),
    },
    logoContainer: {
      alignItems: 'center',
      marginVertical: moderateScale(32),
    },
    logo: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: moderateScale(15),
    },
    version: {
      textAlign: 'center',
      fontSize: moderateScale(13),
      fontFamily: 'Manrope-Regular',
      marginBottom: moderateScale(8),
    },
    tagline: {
      textAlign: 'center',
      fontSize: moderateScale(17),
      fontFamily: 'Manrope-SemiBold',
      color: theme.colors.text,
      marginBottom: moderateScale(32),
    },
    section: {
      marginBottom: moderateScale(28),
    },
    sectionHeader: {
      fontSize: moderateScale(10.5),
      fontFamily: 'Manrope-SemiBold',
      color: Color(theme.colors.textSecondary).alpha(0.5).toString(),
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: moderateScale(10),
      marginLeft: moderateScale(2),
    },
    contentHeading: {
      fontSize: moderateScale(14),
      fontFamily: 'Manrope-SemiBold',
      color: Color(theme.colors.text).alpha(0.85).toString(),
      marginBottom: moderateScale(10),
    },
    bodyText: {
      fontSize: moderateScale(13),
      fontFamily: 'Manrope-Regular',
      color: Color(theme.colors.textSecondary).alpha(0.45).toString(),
      lineHeight: moderateScale(20),
    },
    featureList: {
      gap: moderateScale(10),
    },
    featureItem: {
      backgroundColor: Color(theme.colors.text).alpha(0.04).toString(),
      borderWidth: 1,
      borderColor: Color(theme.colors.text).alpha(0.06).toString(),
      padding: moderateScale(14),
      borderRadius: moderateScale(14),
    },
    featureTitle: {
      fontSize: moderateScale(13.5),
      fontFamily: 'Manrope-SemiBold',
      color: Color(theme.colors.text).alpha(0.85).toString(),
      marginBottom: moderateScale(3),
    },
    featureDescription: {
      fontSize: moderateScale(11.5),
      fontFamily: 'Manrope-Regular',
      color: Color(theme.colors.textSecondary).alpha(0.45).toString(),
      lineHeight: moderateScale(17),
    },
  });
