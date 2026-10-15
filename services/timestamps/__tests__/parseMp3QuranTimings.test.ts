// @ai-generated
import {parseMp3QuranTimings} from '../parseMp3QuranTimings';

describe('MP3Quran browser timings', () => {
  it('preserves millisecond offsets and the requested surah', () => {
    expect(
      parseMp3QuranTimings([{ayah: 2, start_time: 7560, end_time: 37100}], 5),
    ).toEqual([
      {
        surahNumber: 5,
        ayahNumber: 2,
        timestampFrom: 7560,
        timestampTo: 37100,
        durationMs: 29540,
      },
    ]);
  });
  it.each([
    null,
    {},
    [],
    [{ayah: 1, start_time: '0', end_time: 100}],
    [{ayah: 1, start_time: 100, end_time: 50}],
    [{ayah: 0, start_time: 0, end_time: 10}],
  ])(
    'rejects invalid responses instead of producing broken seek positions: %p',
    raw => {
      expect(parseMp3QuranTimings(raw, 5)).toBeNull();
    },
  );
});
