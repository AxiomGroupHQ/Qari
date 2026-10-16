import {create} from 'zustand';
import {
  authApi,
  AuthError,
  type AuthResponse,
  type AuthUser,
} from '@/services/auth/AuthClient';
import {
  clearSession,
  loadSession,
  saveSession,
} from '@/services/auth/tokenStorage';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: Status;
  user: AuthUser | null;
  token: string | null;
  init: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const apply = async (r: AuthResponse) => {
    await saveSession({token: r.token, expiresAt: r.expiresAt});
    set({status: 'signedIn', user: r.user, token: r.token});
  };
  const reset = async () => {
    await clearSession();
    set({status: 'signedOut', user: null, token: null});
  };

  return {
    status: 'loading',
    user: null,
    token: null,

    // Restore a saved session on app start. Offline keeps the user signed in
    // (we only sign out when the server says the token is invalid).
    init: async () => {
      const session = await loadSession();
      if (!session) {
        set({status: 'signedOut'});
        return;
      }
      try {
        const {user} = await authApi.me(session.token);
        set({status: 'signedIn', user, token: session.token});
      } catch (e) {
        if (e instanceof AuthError && e.code === 'unauthorized') {
          await reset();
        } else {
          set({status: 'signedIn', user: null, token: session.token});
        }
      }
    },

    signInWithEmail: async (email, password) =>
      apply(await authApi.login(email, password)),
    register: async (email, password, name) =>
      apply(await authApi.register(email, password, name)),
    signInWithGoogleIdToken: async idToken =>
      apply(await authApi.google(idToken)),

    signOut: async () => {
      const token = get().token;
      if (token) await authApi.logout(token).catch(() => undefined);
      await reset();
    },
    deleteAccount: async () => {
      const token = get().token;
      if (token) await authApi.deleteAccount(token);
      await reset();
    },
  };
});
