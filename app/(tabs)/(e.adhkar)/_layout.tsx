import {Stack} from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';
import {AdhkarAudioProvider} from '@/components/adhkar/AdhkarAudioProvider';
import {useTheme} from '@/hooks/useTheme';
import {USE_GLASS} from '@/hooks/useGlassProps';
import {t} from '@/i18n';

// Always keep the category list under any adhkar screen, so a page opened
// directly (reload, deep link, shared URL) still has a Back target.
export const unstable_settings = {initialRouteName: 'adhkar/index'};

export default function AdhkarLayout() {
  const {theme} = useTheme();

  return (
    <ErrorBoundary>
      <AdhkarAudioProvider>
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
          <Stack.Screen
            name="adhkar/index"
            options={{title: t('recitersView.adhkar')}}
          />
          <Stack.Screen name="adhkar/[superId]/index" />
          <Stack.Screen name="adhkar/[superId]/[dhikrId]" />
          <Stack.Screen name="adhkar/saved/index" />
          <Stack.Screen name="adhkar/saved/[dhikrId]" />
        </Stack>
      </AdhkarAudioProvider>
    </ErrorBoundary>
  );
}
