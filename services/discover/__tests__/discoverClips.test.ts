import {pickRandomClip, timedSurahs} from '../discoverClips';

const rewayat = (over = {}) =>
  ({
    id: 'w1',
    reciter_id: 'r1',
    has_timestamps: true,
    surah_list: [1, 2, null],
    timestamps_surah_list: [2],
    ...over,
  }) as never;
const reciter = (rw: unknown) =>
  ({id: 'r1', name: 'R', rewayat: [rw]}) as never;

describe('discoverClips', () => {
  it('only offers surahs that are both playable and timed', () => {
    expect(timedSurahs(rewayat())).toEqual([2]);
    expect(timedSurahs(rewayat({timestamps_surah_list: undefined}))).toEqual([
      1, 2,
    ]);
  });

  it('returns null when no rewayat has timings', async () => {
    const clip = await pickRandomClip({
      reciters: [reciter(rewayat({has_timestamps: false}))],
      getTimestamps: async () => null,
    });
    expect(clip).toBeNull();
  });

  it('picks a usable ayah and skips too-short ones', async () => {
    const clip = await pickRandomClip({
      reciters: [reciter(rewayat())],
      random: () => 0,
      getTimestamps: async () => [
        {
          surahNumber: 2,
          ayahNumber: 1,
          timestampFrom: 0,
          timestampTo: 500,
          durationMs: 500,
        },
        {
          surahNumber: 2,
          ayahNumber: 2,
          timestampFrom: 500,
          timestampTo: 9500,
          durationMs: 9000,
        },
      ],
    });
    expect(clip?.verseKey).toBe('2:2');
    expect(clip?.startMs).toBe(500);
    expect(clip?.endMs).toBe(9500);
  });

  it('does not repeat an excluded clip', async () => {
    const clip = await pickRandomClip(
      {
        reciters: [reciter(rewayat())],
        random: () => 0,
        getTimestamps: async () => [
          {
            surahNumber: 2,
            ayahNumber: 2,
            timestampFrom: 500,
            timestampTo: 9500,
            durationMs: 9000,
          },
        ],
      },
      new Set(['w1:2:2']),
    );
    expect(clip).toBeNull();
  });
});
