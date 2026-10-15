import {isArabicInterface} from '@/localization/arabicInterface';
// @ai-generated
import React, {useMemo} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {useTheme} from '@/hooks/useTheme';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import {Theme} from '@/utils/themeUtils';
import Color from 'color';
import {IstimaWordmark} from '@/components/branding/IstimaWordmark'; // @ai
import {VersionDisplay} from '@/components/VersionDisplay';

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

          <Text style={styles.tagline}>{isArabicInterface() ? 'استمع. تدبّر. اذكر الله.' : 'Listen. Reflect. Remember Allah.'}</Text>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>Alhamdulillah</Text>
            <Text style={styles.bodyText}>
              All praise is due to Allah. ISTIMA — استماع — is a place to
              listen, reflect, and strengthen your connection with the Quran.
              Built for the Ummah by Halalweb, it brings Quran recitation,
              reading, and learning together in one calm space.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>{isArabicInterface() ? 'رسالتنا' : 'Our Mission'}</Text>
            <Text style={styles.bodyText}>
              Quran • Bayan • Tafsir • Knowledge. Our aim is to make listening
              and reflection part of everyday life: at home, on the move, and
              wherever you have a moment to remember Allah.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{isArabicInterface() ? 'الميزات' : 'FEATURES'}</Text>
            <View style={styles.featureList}>
              <Feature
                title={isArabicInterface() ? 'التنزيلات دون اتصال' : 'Offline Downloads'}
                description={isArabicInterface() ? 'نزّل السور للاستماع إليها دون اتصال بالإنترنت في أي وقت ومكان' : 'Download surahs for offline listening anytime, anywhere without internet connection'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'قوائم تشغيل مخصصة' : 'Custom Playlists'}
                description={isArabicInterface() ? 'أنشئ قوائم تشغيل لتلاواتك المفضلة وأدرها' : 'Create and manage your own personalized playlists of your favorite recitations'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'التصفح حسب الجزء' : 'Browse by Juz'}
                description={isArabicInterface() ? 'تصفّح القرآن بسهولة من خلال تنظيمه حسب الأجزاء' : 'Easily navigate through the Quran with Juz-based organization and grouping'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'عناصر تحكم صوتية متقدمة' : 'Advanced Audio Controls'}
                description={isArabicInterface() ? 'تحكّم دقيق في التشغيل المتواصل وسرعة التلاوة' : 'Precise playback control with continuous play and adjustable recitation speed'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'صوت عالي الجودة' : 'High-Quality Audio'}
                description={isArabicInterface() ? 'تلاوات واضحة وعالية الجودة من قراء متميزين' : 'Crystal clear recitations from the world's best Qaris with optimized streaming'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'مجموعات مختارة' : 'Curated Collections'}
                description={isArabicInterface() ? 'سور منظمة بعناية حسب المناسبات والموضوعات' : 'Thoughtfully organized surahs for different occasions and themes'}
                styles={styles}
              />
              <Feature
                title={isArabicInterface() ? 'التخصيص' : 'Personalization'}
                description={isArabicInterface() ? 'خصّص المظهر والألوان وإعدادات الصوت كما تفضّل' : 'Customize themes, accent colors, and audio settings to your liking'}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>{isArabicInterface() ? 'اقرأ واستمع وتدبّر' : 'Read, Listen, and Reflect'}</Text>
            <Text style={styles.bodyText}>
              Read the Mushaf, explore translations and tafsir, save verses and
              notes, and return to daily adhkar. Choose your reciter, build
              playlists, and shape a listening experience that suits your day.
              Available features vary by device; native apps also support
              downloads for offline listening.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.contentHeading}>{isArabicInterface() ? 'التزامنا' : 'Our Commitment'}</Text>
            <Text style={styles.bodyText}>
              We care about the accuracy of sacred content, respectful design,
              and reliable access. We continue to improve ISTIMA with care for
              the people who use it. May Allah accept this effort and make it
              beneficial for everyone who listens, reads, and reflects.
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
