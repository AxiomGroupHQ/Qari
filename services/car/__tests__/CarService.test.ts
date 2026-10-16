import {
  buildReciterItems,
  getCarAvailability,
  startCarService,
  resetCarServiceForTests,
  CarAdapter,
} from '../CarService';

const mockUpdateQueue = jest.fn();
jest.mock('@/config/featureFlags', () => ({isFeatureEnabled: () => true}));
jest.mock('@/services/dataService', () => ({
  getAllReciters: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/utils/audioUtils', () => ({
  generateSmartAudioUrl: () => 'https://x/1.mp3',
}));
jest.mock('@/utils/artworkUtils', () => ({getReciterArtwork: () => 'art'}));
jest.mock('@/services/player/store/playerStore', () => ({
  usePlayerStore: {getState: () => ({updateQueue: mockUpdateQueue})},
}));

const reciter = {
  id: 'r1',
  name: 'Reciter One',
  rewayat: [{id: 'w1'}],
} as never;

function fakeAdapter(): CarAdapter & {pushed: string[]} {
  const pushed: string[] = [];
  return {
    pushed,
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    setRootList: jest.fn(),
    pushList: (t: string) => {
      pushed.push(t);
    },
    showNowPlaying: jest.fn(),
  };
}

describe('CarService', () => {
  beforeEach(() => resetCarServiceForTests());

  it('reports not available yet without a native bridge', async () => {
    expect(getCarAvailability(null)).toBe('not_available_yet');
    expect(await startCarService(null)).toBe('not_available_yet');
  });

  it('registers handlers when a bridge exists', async () => {
    const a = fakeAdapter();
    expect(await startCarService(a)).toBe('ready');
    expect(a.onConnect).toHaveBeenCalled();
  });

  it('opens surahs for a reciter and plays one', async () => {
    const a = fakeAdapter();
    const items = buildReciterItems([reciter], a);
    expect(items).toHaveLength(1);
    await items[0].onPress();
    expect(a.pushed).toEqual(['Reciter One']);
  });
});
