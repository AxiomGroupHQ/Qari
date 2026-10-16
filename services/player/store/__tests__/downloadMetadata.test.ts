jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));
jest.mock('@/services/analytics/AnalyticsService', () => ({
  analyticsService: {trackDownloadCompleted: jest.fn()},
}));

import {RECITERS} from '@/data/reciterData';
import {withReciterMetadata, DownloadedSurah} from '../downloadStore';
import {reciterForDownload} from '../../utils/reciterForDownload';

const base: DownloadedSurah = {
  reciterId: 'r-test',
  surahId: '1',
  rewayatId: 'rw-1',
  filePath: 'x.mp3',
  fileSize: 1,
  downloadDate: 1,
  status: 'completed',
};

describe('download reciter metadata (offline resilience)', () => {
  afterEach(() => {
    const i = RECITERS.findIndex(r => r.id === 'r-test');
    if (i >= 0) RECITERS.splice(i, 1);
  });

  it('copies name, image and rewayat from the reciter list when known', () => {
    RECITERS.push({
      id: 'r-test',
      name: 'Test Reciter',
      date: null,
      image_url: 'https://img/x.png',
      rewayat: [{id: 'rw-1', name: 'Hafs'} as never],
    });
    const out = withReciterMetadata(base);
    expect(out.reciterName).toBe('Test Reciter');
    expect(out.reciterImageUrl).toBe('https://img/x.png');
    expect(out.rewayatName).toBe('Hafs');
  });

  it('is idempotent and never overwrites saved data', () => {
    const saved = {...base, reciterName: 'Saved'};
    expect(withReciterMetadata(saved)).toBe(saved);
  });

  it('leaves records alone when the reciter list is empty', () => {
    expect(withReciterMetadata(base)).toBe(base);
  });

  it('builds a display reciter from saved data when the list is empty', () => {
    const r = reciterForDownload(
      {...base, reciterName: 'Saved', reciterImageUrl: null},
      null,
    );
    expect(r?.name).toBe('Saved');
    expect(reciterForDownload(base, null)).toBeNull();
  });
});
