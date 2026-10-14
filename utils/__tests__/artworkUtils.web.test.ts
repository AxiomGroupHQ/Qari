// @ai-generated
import {getReciterArtwork} from '../artworkUtils.web';
import type {Reciter} from '@/data/reciterData';

jest.mock('expo-asset', () => ({
  Asset: {fromModule: (id: number) => ({uri: `/assets/${id}.png`})},
}));
jest.mock('../reciterImages', () => ({
  reciterImages: {
    'local-reciter': {uri: '/assets/local-reciter.png'},
    'numeric-reciter': 7,
  },
}));
jest.mock('@/assets/images/icon.png', () => 99);

function reciter(name: string, image_url: string | null = null): Reciter {
  return {id: 'test', name, date: '2026-10-14', image_url, rewayat: []};
}

describe('browser track artwork', () => {
  it('resolves bundled artwork without native Image.resolveAssetSource', () => {
    expect(getReciterArtwork(reciter('Local Reciter'))).toBe(
      '/assets/local-reciter.png',
    );
    expect(getReciterArtwork(reciter('Numeric Reciter'))).toBe('/assets/7.png');
  });
  it('uses the ISTIMA icon when no reciter photo is available', () => {
    expect(getReciterArtwork(reciter('Unknown'))).toBe('/assets/99.png');
  });
  it('keeps remote artwork secure', () => {
    expect(
      getReciterArtwork(reciter('Remote', 'http://example.com/photo.png')),
    ).toBe('https://example.com/photo.png');
  });
});
