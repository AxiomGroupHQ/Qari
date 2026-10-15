import {Stack} from 'expo-router';
import {AdhkarAudioProvider} from '@/components/adhkar/AdhkarAudioProvider';
import {useTheme} from '@/hooks/useTheme';
import {USE_GLASS} from '@/hooks/useGlassProps';
import {t} from '@/i18n';

export default function AdhkarLayout() {
  const {theme} = useTheme();

  return (
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
          name="index"
          options={{title: t('recitersView.adhkar')}}
        />
        <Stack.Screen name="[superId]/index" />
        <Stack.Screen name="[superId]/[dhikrId]" />
        <Stack.Screen name="saved" />
      </Stack>
    </AdhkarAudioProvider>
  );
}
