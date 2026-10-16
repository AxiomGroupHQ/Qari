import {Stack} from 'expo-router';
import {USE_GLASS} from '@/hooks/useGlassProps';
import {MaxWidthContainer} from '@/components/layout/MaxWidthContainer';
import {t} from '@/i18n';

export default function HomeLayout() {
  return (
    <MaxWidthContainer>
      <Stack
        screenOptions={{
          headerShown: true,
          freezeOnBlur: true,
          headerTransparent: true,
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="reciter/[id]"
          options={{
            title: '',
            // Non-glass devices use custom NavigationButtons; hide native header to avoid clash
            headerShown: USE_GLASS,
          }}
        />
        <Stack.Screen
          name="reciter/browse"
          options={{
            // Non-glass devices use custom Header component inside BrowseReciters
            headerShown: USE_GLASS,
          }}
        />
        <Stack.Screen name="playlist/[id]" options={{title: ''}} />
        <Stack.Screen
          name="translations"
          options={{title: t('common.translationsTafaseer')}}
        />
        <Stack.Screen
          name="browse-all"
          options={{
            title: t('common.reciters'),
            // Non-glass devices use the compact in-content header inside
            // BrowseReciters; hide native header to avoid clash
            headerShown: USE_GLASS,
          }}
        />
        <Stack.Screen
          name="browse-all-surahs"
          options={{
            title: t('common.allSurahs'),
            // Non-glass devices use custom Header component; hide native header to avoid clash
            headerShown: USE_GLASS,
          }}
        />
      </Stack>
    </MaxWidthContainer>
  );
}
