jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn()},
}));
jest.mock('expo-audio', () => ({createAudioPlayer: jest.fn()}));
jest.mock('@/i18n', () => ({
  resolveLocale: (p: string) => (p === 'system' ? 'en' : p),
}));
jest.mock('@/assets/audio/intro/en.mp3', () => 1, {virtual: true});

import {createAudioPlayer} from 'expo-audio';
import {useLanguageStore} from '@/store/languageStore';
import {
  clipUrlFor,
  introClipService,
  shouldPlayEndClip,
} from '../IntroClipService';

type Listener = (s: Record<string, unknown>) => void;
function fakePlayer(finish: boolean) {
  let l: Listener = () => {};
  return {
    addListener: (_e: string, fn: Listener) => {
      l = fn;
      return {remove: jest.fn()};
    },
    play: jest.fn(() => {
      setTimeout(() => {
        l({isLoaded: true});
        if (finish) l({isLoaded: true, didJustFinish: true});
      }, 0);
    }),
    pause: jest.fn(),
    remove: jest.fn(),
  };
}

describe('IntroClipService', () => {
  beforeEach(() => {
    (createAudioPlayer as jest.Mock).mockReset();
    useLanguageStore.setState({preference: 'en'});
  });

  it('end clip only for surahs over 3 minutes', () => {
    expect(shouldPlayEndClip(179)).toBe(false);
    expect(shouldPlayEndClip(180)).toBe(false);
    expect(shouldPlayEndClip(181)).toBe(true);
    expect(shouldPlayEndClip(NaN)).toBe(false);
  });

  it('maps languages to urls, null for fallback languages', () => {
    expect(clipUrlFor('de')).toBe('https://iapi.istima.app/clips/de.mp3');
    expect(clipUrlFor('wo')).toBeNull();
    expect(clipUrlFor('en')).toBeNull();
  });

  it('plays the bundled English clip for English and resolves true', async () => {
    (createAudioPlayer as jest.Mock).mockReturnValue(fakePlayer(true));
    await expect(introClipService.play('start')).resolves.toBe(true);
    expect(createAudioPlayer).toHaveBeenCalledWith(1);
  });

  it('uses the localized url first', async () => {
    useLanguageStore.setState({preference: 'de'});
    (createAudioPlayer as jest.Mock).mockReturnValue(fakePlayer(true));
    await introClipService.play('end');
    expect(createAudioPlayer).toHaveBeenCalledWith({
      uri: 'https://iapi.istima.app/clips/de.mp3',
    });
  });

  it('falls back to English when the player throws, and never throws itself', async () => {
    useLanguageStore.setState({preference: 'de'});
    (createAudioPlayer as jest.Mock)
      .mockImplementationOnce(() => {
        throw new Error('network');
      })
      .mockReturnValueOnce(fakePlayer(true));
    await expect(introClipService.play('start')).resolves.toBe(true);
    expect(createAudioPlayer).toHaveBeenLastCalledWith(1);
  });

  it('stop() cancels a playing clip', async () => {
    (createAudioPlayer as jest.Mock).mockReturnValue(fakePlayer(false));
    const p = introClipService.play('start');
    introClipService.stop();
    await expect(p).resolves.toBe(false);
  });
});
