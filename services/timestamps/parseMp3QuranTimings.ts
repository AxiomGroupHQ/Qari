// @ai-generated
import type {AyahTimestamp} from '@/types/timestamps';

export function parseMp3QuranTimings(
  raw: unknown,
  surah: number,
): AyahTimestamp[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const timestamps: AyahTimestamp[] = [];
  for (const entry of raw) {
    if (
      !entry ||
      !Number.isInteger(entry.ayah) ||
      entry.ayah < 1 ||
      !Number.isFinite(entry.start_time) ||
      !Number.isFinite(entry.end_time) ||
      entry.start_time < 0 ||
      entry.end_time <= entry.start_time
    )
      return null;
    timestamps.push({
      surahNumber: surah,
      ayahNumber: entry.ayah,
      timestampFrom: entry.start_time,
      timestampTo: entry.end_time,
      durationMs: entry.end_time - entry.start_time,
    });
  }
  return timestamps;
}
