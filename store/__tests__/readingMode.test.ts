const mem: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mem[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mem[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      delete mem[k];
    }),
  },
}));

import {useMushafSettingsStore} from '@/store/mushafSettingsStore';

describe('reading mode', () => {
  it('follows the app theme by default so existing users keep their look', () => {
    expect(useMushafSettingsStore.getState().readingMode).toBe('app');
  });
  it('can be set without touching the app theme store', () => {
    useMushafSettingsStore.getState().setReadingMode('dark');
    expect(useMushafSettingsStore.getState().readingMode).toBe('dark');
    useMushafSettingsStore.getState().setReadingMode('app');
  });
});
