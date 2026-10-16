import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEY = 'istima.auth.session';

export interface StoredSession {
  token: string;
  expiresAt: number;
}

// Keychain / Keystore on iOS and Android. Browsers have no secure store, so the web uses
// localStorage (via AsyncStorage).
const useSecure = Platform.OS !== 'web';

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = useSecure
      ? await SecureStore.getItemAsync(KEY)
      : await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    return typeof s.token === 'string' && s.expiresAt > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  const raw = JSON.stringify(session);
  if (useSecure) await SecureStore.setItemAsync(KEY, raw);
  else await AsyncStorage.setItem(KEY, raw);
}

export async function clearSession(): Promise<void> {
  if (useSecure) await SecureStore.deleteItemAsync(KEY);
  else await AsyncStorage.removeItem(KEY);
}
