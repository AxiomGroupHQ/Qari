import {buildSharedRows} from '../sharedPlaylistTracks';

jest.mock('@/services/dataService', () => ({
  getReciterByIdSync: (id: string) =>
    id === 'r1' ? {id: 'r1', name: 'Reciter One', rewayat: [{id: 'w1'}]} : null,
}));
jest.mock('@/utils/audioUtils', () => ({
  generateSmartAudioUrl: (_r: unknown, s: string) => `https://x/${s}.mp3`,
}));
jest.mock('@/utils/artworkUtils', () => ({getReciterArtwork: () => 'art'}));

describe('buildSharedRows', () => {
  it('skips unknown reciters and bad surahs', () => {
    const rows = buildSharedRows([
      {surahId: '1', reciterId: 'r1'},
      {surahId: '2', reciterId: 'missing'},
      {surahId: '999', reciterId: 'r1'},
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].track.url).toBe('https://x/1.mp3');
    expect(rows[0].reciterName).toBe('Reciter One');
  });
});
