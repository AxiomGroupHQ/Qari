jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn()},
}));

import {surahForDate} from '../dailyReminder';
import {SURAHS} from '@/data/surahData';

describe('daily reminder', () => {
  it('picks the same surah as the home card rule', () => {
    expect(surahForDate(new Date(2026, 0, 1))).toBe(SURAHS[1]);
    expect(surahForDate(new Date(2026, 0, 2))).toBe(SURAHS[2]);
  });
  it('wraps around after 114', () => {
    const s = surahForDate(new Date(2026, 5, 15));
    expect(SURAHS).toContain(s);
  });
});
