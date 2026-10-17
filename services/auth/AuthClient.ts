import branding from '@/config/branding';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export type AuthErrorCode =
  | 'invalid_email'
  | 'weak_password'
  | 'email_taken'
  | 'invalid_credentials'
  | 'too_many_attempts'
  | 'invalid_google_token'
  | 'google_not_configured'
  | 'email_not_verified'
  | 'unauthorized'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, public status = 0) {
    super(code);
  }
}

const KNOWN: AuthErrorCode[] = [
  'invalid_email',
  'weak_password',
  'email_taken',
  'invalid_credentials',
  'too_many_attempts',
  'invalid_google_token',
  'google_not_configured',
  'email_not_verified',
  'unauthorized',
];

async function request<T>(
  path: string,
  init: {method?: string; body?: unknown; token?: string} = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${branding.apiBaseUrl}${path}`, {
      method: init.method ?? (init.body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(init.token ? {Authorization: `Bearer ${init.token}`} : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new AuthError('network');
  }
  const data = (await res.json().catch(() => ({}))) as {error?: string};
  if (!res.ok) {
    const code = KNOWN.includes(data.error as AuthErrorCode)
      ? (data.error as AuthErrorCode)
      : 'unknown';
    throw new AuthError(code, res.status);
  }
  return data as T;
}

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/v1/auth/register', {body: {email, password, name}}),
  login: (email: string, password: string) =>
    request<AuthResponse>('/v1/auth/login', {body: {email, password}}),
  google: (idToken: string) =>
    request<AuthResponse>('/v1/auth/google', {body: {idToken}}),
  me: (token: string) => request<{user: AuthUser}>('/v1/me', {token}),
  logout: (token: string) =>
    request<{ok: boolean}>('/v1/auth/logout', {
      method: 'POST',
      body: {},
      token,
    }),
  deleteAccount: (token: string) =>
    request<{ok: boolean}>('/v1/me', {method: 'DELETE', token}),
};

export interface SyncDoc {
  key: string;
  value: unknown;
  updatedAt: number;
}

export const syncApi = {
  pull: (token: string, since = 0) =>
    request<{serverTime: number; docs: SyncDoc[]}>(`/v1/sync?since=${since}`, {
      token,
    }),
  push: (token: string, key: string, value: unknown) =>
    request<{key: string; updatedAt: number}>(`/v1/sync/${key}`, {
      method: 'PUT',
      body: {value},
      token,
    }),
};
