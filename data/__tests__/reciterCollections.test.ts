jest.mock('@/store/timestampStore', () => ({
  useTimestampStore: {getState: () => ({})},
}));

import {RECITERS, Reciter} from '../reciterData';
import {
  getFeaturedReciters,
  getBeginnerFriendlyReciters,
} from '../reciterCollections';

const NAMES = [
  'Mohammed Ayyub',
  'Noreen Mohammad Siddiq',
  'Abdullah Qarafi',
  'Bandar Balilah',
  'Abdulrasheed Soufi',
  'Ahmad Talib bin Humaid',
  'Ahmad Alhuthaifi',
  'Abdulrahman Al-Majed',
  'Albaraa Basfar',
  'Hasan Saleh',
  'Haitham Aldukhain',
  'Yasser Al-Dosari',
  'Mohammed Al-Lohaidan',
  'Abdullah Al-Johany',
  'Mishary Alafasi',
  'Maher Al Meaqli',
  'Saad Al-Ghamdi',
  'Saud Al-Shuraim',
];

beforeAll(() => {
  RECITERS.length = 0;
  NAMES.forEach((name, i) =>
    RECITERS.push({id: `id${i}`, name, rewayat: []} as unknown as Reciter),
  );
});

describe('rotating home rows', () => {
  it('pins Ayyub and Noreen to the first two featured slots', () => {
    for (const seed of [1, 99, 123456789, Date.now()]) {
      const names = getFeaturedReciters(10, seed).map(r => r.name);
      expect(names.slice(0, 2)).toEqual([
        'Mohammed Ayyub',
        'Noreen Mohammad Siddiq',
      ]);
    }
  });
  it('is stable for one seed and changes across seeds', () => {
    const a = getFeaturedReciters(10, 5).map(r => r.id);
    expect(getFeaturedReciters(10, 5).map(r => r.id)).toEqual(a);
    const sets = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(s =>
        getFeaturedReciters(10, s * 7919)
          .map(r => r.id)
          .join(),
      ),
    );
    expect(sets.size).toBeGreaterThan(3);
  });
  it('has no duplicates and rotates beginners with Noreen first', () => {
    const f = getFeaturedReciters(10, 42).map(r => r.id);
    expect(new Set(f).size).toBe(f.length);
    const b = getBeginnerFriendlyReciters(8, 42);
    expect(b[0].name).toBe('Noreen Mohammad Siddiq');
  });
});
