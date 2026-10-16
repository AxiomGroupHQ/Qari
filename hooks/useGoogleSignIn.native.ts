import {useEffect} from 'react';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import branding from '@/config/branding';
import {useAuthStore} from '@/store/authStore';

/**
 * Native Google sign-in for iOS and Android (Credential Manager on Android, Google Sign-In SDK
 * on iOS). It returns an ID token that our API verifies against Google's keys, same as web.
 * Needs a development/production build (not Expo Go) and the web + iOS client IDs in
 * config/branding.js.
 */
export function useGoogleSignIn(onError: (e: unknown) => void) {
  const ids = branding.googleClientIds;
  const signIn = useAuthStore(s => s.signInWithGoogleIdToken);

  useEffect(() => {
    if (!ids.web) return;
    GoogleSignin.configure({
      webClientId: ids.web,
      iosClientId: ids.ios || undefined,
      scopes: ['email', 'profile'],
    });
  }, [ids.web, ids.ios]);

  return {
    available: !!ids.web,
    ready: true,
    start: async () => {
      try {
        await GoogleSignin.hasPlayServices();
        const res = await GoogleSignin.signIn();
        if (!isSuccessResponse(res)) return; // user cancelled
        const idToken = res.data.idToken;
        if (idToken) await signIn(idToken);
      } catch (e) {
        onError(e);
      }
    },
  };
}
