import {Stack} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';
import {USE_GLASS} from '@/hooks/useGlassProps';
import {MaxWidthContainer} from '@/components/layout/MaxWidthContainer';
import branding from '@/config/branding';
import {t} from '@/i18n';

export default function SettingsLayout() {
  const {theme} = useTheme();

  return (
    <MaxWidthContainer>
      <Stack
        screenOptions={{
          headerShown: true,
          freezeOnBlur: true,
          headerTintColor: theme.colors.text,
          ...(USE_GLASS
            ? {
                headerTransparent: true,
                headerStyle: {backgroundColor: 'transparent'},
              }
            : {
                headerStyle: {backgroundColor: theme.colors.background},
              }),
          headerTitleStyle: {
            fontFamily: 'Manrope-SemiBold',
            color: theme.colors.text,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen
          name="language"
          options={{title: t('settings.language')}}
        />
        <Stack.Screen name="storage" options={{title: t('common.storage')}} />
        <Stack.Screen
          name="about"
          options={{title: t('settings.aboutApp', {name: branding.appName})}}
        />
        <Stack.Screen
          name="mushaf-settings"
          options={{title: t('common.mushafSettings')}}
        />
        <Stack.Screen
          name="default-reciter"
          options={{title: t('common.defaultReciter')}}
        />
        <Stack.Screen
          name="reciter-choice"
          options={{title: t('common.reciterChoice')}}
        />
        <Stack.Screen
          name="account"
          options={{title: t('tabs.settings.account')}}
        />
        <Stack.Screen
          name="translations"
          options={{title: t('common.translationsTafaseer')}}
        />
        <Stack.Screen
          name="reading-theme"
          options={{title: t('common.readingTheme')}}
        />
        <Stack.Screen
          name="whats-new"
          options={{title: t('common.whatSNew')}}
        />
      </Stack>
    </MaxWidthContainer>
  );
}
