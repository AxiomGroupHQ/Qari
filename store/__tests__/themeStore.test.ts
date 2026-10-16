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

function load() {
  let store: typeof import('../themeStore');
  jest.isolateModules(() => {
    store = require('../themeStore');
  });
  return store!.useThemeStore;
}

describe('themeStore defaults and migration', () => {
  beforeEach(() => {
    Object.keys(mem).forEach(k => delete mem[k]);
  });

  it('defaults to dark with nothing stored', async () => {
    const s = load();
    await s.persist.rehydrate();
    expect(s.getState().themeMode).toBe('dark');
    expect(s.getState().theme.isDarkMode).toBe(true);
  });

  it('moves old stored Auto (v0) to dark once', async () => {
    mem['theme-storage'] = JSON.stringify({
      state: {themeMode: 'system', primaryColor: 'Blue'},
      version: 0,
    });
    const s = load();
    await s.persist.rehydrate();
    expect(s.getState().themeMode).toBe('dark');
  });

  it('keeps stored Light, and Auto saved after the migration', async () => {
    mem['theme-storage'] = JSON.stringify({
      state: {themeMode: 'light', primaryColor: 'Blue'},
      version: 0,
    });
    let s = load();
    await s.persist.rehydrate();
    expect(s.getState().themeMode).toBe('light');

    mem['theme-storage'] = JSON.stringify({
      state: {themeMode: 'system', primaryColor: 'Blue'},
      version: 1,
    });
    s = load();
    await s.persist.rehydrate();
    expect(s.getState().themeMode).toBe('system');
  });
});
