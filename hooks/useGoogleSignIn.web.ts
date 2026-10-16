import {useEffect} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import branding from '@/config/branding';
import {useAuthStore} from '@/store/authStore';

WebBrowser.maybeCompleteAuthSession();

/**
 * Google sign-in via the OAuth ID-token flow on web, iOS and Android. The ID token is sent to
 * our API, which verifies it against Google's keys. `available` is false until the web client
 * ID is set in config/branding.js, and the UI hides the button.
 */
export function useGoogleSignIn(onError: (e: unknown) => void) {
  const ids = branding.googleClientIds;
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // The hook needs a non-empty value to build a request, the button is hidden when unset.
    clientId: ids.web || 'unset',
    webClientId: ids.web || 'unset',
    iosClientId: ids.ios || undefined,
    androidClientId: ids.android || undefined,
  });
  const signIn = useAuthStore(s => s.signInWithGoogleIdToken);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken =
      response.params?.id_token ?? response.authentication?.idToken;
    if (idToken) signIn(idToken).catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    available: !!ids.web,
    ready: !!request,
    start: () => promptAsync(),
  };
}
