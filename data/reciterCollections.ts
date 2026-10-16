import {RECITERS, Reciter} from './reciterData';
import {useTimestampStore} from '@/store/timestampStore';

// Featured Reciters - Spotlight reciters chosen by Istima
// Always shown first in the Featured row (rotation applies to the rest).
const FEATURED_PINNED_NAMES = ['Mohammed Ayyub', 'Noreen Mohammad Siddiq'];

const FEATURED_RECITER_NAMES = [
  'Abdullah Qarafi',
  'Bandar Balilah',
  'Abdulrasheed Soufi',
  'Ahmad Talib bin Humaid',
  'Ahmad Alhuthaifi',
  'Abdulrahman Al-Majed',
  'Albaraa Basfar',
  'Hasan Saleh',
];

// Trending Reciters - Currently popular among users
const TRENDING_RECITER_NAMES = [
  'Ahmad Talib bin Humaid',
  'Haitham Aldukhain',
  'Yasser Al-Dosari',
  'Mohammed Al-Lohaidan',
  'Abdullah Al-Johany',
];

// Istima Originals - Exclusive recitations curated by Istima
const ISTIMA_ORIGINALS_RECITER_NAMES = [
  'Albaraa Basfar',
  'Hazem Hassan',
  'Mohammed Hamed',
  'Malik Ahmad',
  'Hani Alhussaini',
  'Ayyub Asif',
  'Abdulrahman Mosad',
];

// Best for Tajweed - Reciters known for excellent tajweed and correct pronunciation
const TAJWEED_RECITER_NAMES = [
  'Mahmoud Khalil Al-Hussary',
  'Mohammed Ayyub',
  'Mohammed Siddiq Al-Minshawi',
  'Abdulbasit Abdulsamad',
  'Mahmoud Ali Albanna',
  'Mustafa Ismail',
  'Abdulrasheen Soufi',
];

// Best for Memorization - Reciters with clear, measured pace ideal for memorization
const MEMORIZATION_RECITER_NAMES = [
  'Mishary Alafasi',
  'Mahmoud Khalil Al-Hussary',
  'Mohammed Siddiq Al-Minshawi Muallim',
  'Khalifa Al-Tunaiji',
  'Mohammed Jibreel',
  'Salah Al-Budair',
  'Abdullah Al-Mattrod',
  'Idrees Abkr',
  'Yassin Al-Jazaery',
  'Abu Bakr Al-Shatri',
];

// For Beginners - Reciters who are approachable and easy to listen to for first-time listeners
const BEGINNER_FRIENDLY_RECITER_NAMES = [
  'Mishary Alafasi',
  'Maher Al Meaqli',
  'Shaik Abu Bakr Ak Shatri',
  'Abdulrahman Alsudaes',
  'Abdullah Basfer',
  'Saad Al-Ghamdi',
  'Saud Al-Shuraim',
  'Nasser Al-Qatami',
  'Yasser Al-Dosari',
  'Noreen Mohammad Siddiq',
  'Ahmad Al-Ajmy',
];

// Diverse Rewayat - Reciters who excel in multiple narration styles/qira'at
const DIVERSE_REWAYAT_RECITER_NAMES = [
  'Mahmoud Khalil Al-Hussary',
  'Abdulbasit Abdulsamad',
  'Mohammed Siddiq Al-Minshawi',
  'Mohammed Jibreel',
  'Yasser Al-Dosari',
  'Ali Al-Huzaifi',
  'Abdullah Basfar',
  'Ahmed Al-Ajmy',
  'Khalid Al-Qahtani',
];

/**
 * Normalizes a reciter name for comparison (removes spaces, special characters, etc.)
 */
function normalizeReciterName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
    .trim();
}

/** Deterministic shuffle: the same seed gives the same order (stable within one app session). */
function seededOrder<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let x = Math.abs(Math.floor(seed)) % 2147483647 || 1;
  const rand = (): number => {
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Finds a reciter by their name using normalized comparison
 */
function findReciterByName(name: string): Reciter | undefined {
  const normalizedName = normalizeReciterName(name);
  return RECITERS.find(
    reciter => normalizeReciterName(reciter.name) === normalizedName,
  );
}

/**
 * Gets featured reciters chosen by Istima to spotlight
 */
export function getFeaturedReciters(count?: number, seed?: number): Reciter[] {
  const resolve = (names: string[]): Reciter[] =>
    names
      .map(findReciterByName)
      .filter((reciter): reciter is Reciter => reciter !== undefined);
  const pinned = resolve(FEATURED_PINNED_NAMES);
  const pinnedIds = new Set(pinned.map(r => r.id));
  // Rotation pool: the featured list plus trending and beginner picks.
  const pool = resolve([
    ...FEATURED_RECITER_NAMES,
    ...TRENDING_RECITER_NAMES,
    ...BEGINNER_FRIENDLY_RECITER_NAMES,
  ]).filter(
    (r, i, all) =>
      !pinnedIds.has(r.id) && all.findIndex(x => x.id === r.id) === i,
  );
  const rest = seed === undefined ? pool : seededOrder(pool, seed);
  const reciters = [...pinned, ...rest];
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets trending reciters that are currently popular among users
 */
export function getTrendingReciters(count?: number): Reciter[] {
  const reciters = TRENDING_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets Istima's exclusive curated recitations
 */
export function getIstimaOriginalsReciters(count?: number): Reciter[] {
  const reciters = ISTIMA_ORIGINALS_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets a list of reciters known for excellent tajweed and correct pronunciation
 */
export function getTajweedReciters(count?: number): Reciter[] {
  const reciters = TAJWEED_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets a list of reciters ideal for memorization with clear, measured pace
 */
export function getMemorizationReciters(count?: number): Reciter[] {
  const reciters = MEMORIZATION_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets a list of reciters who are approachable for beginners
 */
export function getBeginnerFriendlyReciters(
  count?: number,
  seed?: number,
): Reciter[] {
  const all = BEGINNER_FRIENDLY_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  // Noreen Mohammad Siddiq is pinned first; the others rotate by seed.
  const pinned = all.filter(r => FEATURED_PINNED_NAMES.includes(r.name));
  const rest = all.filter(r => !pinned.includes(r));
  const reciters = [
    ...pinned,
    ...(seed === undefined ? rest : seededOrder(rest, seed)),
  ];
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets a list of reciters who excel in multiple narration styles/qira'at
 */
export function getDiverseRewayatReciters(count?: number): Reciter[] {
  const reciters = DIVERSE_REWAYAT_RECITER_NAMES.map(findReciterByName).filter(
    (reciter): reciter is Reciter => reciter !== undefined,
  );
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets reciters that support Follow Along (ayah-level timestamps)
 */
export function getFollowAlongReciters(count?: number): Reciter[] {
  const {supportedReciterIds} = useTimestampStore.getState();
  const reciters = RECITERS.filter(r => supportedReciterIds.has(r.id));
  return count ? reciters.slice(0, count) : reciters;
}

/**
 * Gets reciters for a specific collection by name
 */
export function getReciterCollection(
  collectionName:
    | 'featured'
    | 'trending'
    | 'istima-originals'
    | 'tajweed'
    | 'memorization'
    | 'beginner-friendly'
    | 'diverse-rewayat',
  count?: number,
): Reciter[] {
  switch (collectionName) {
    case 'featured':
      return getFeaturedReciters(count);
    case 'trending':
      return getTrendingReciters(count);
    case 'istima-originals':
      return getIstimaOriginalsReciters(count);
    case 'tajweed':
      return getTajweedReciters(count);
    case 'memorization':
      return getMemorizationReciters(count);
    case 'beginner-friendly':
      return getBeginnerFriendlyReciters(count);
    case 'diverse-rewayat':
      return getDiverseRewayatReciters(count);
    default:
      return [];
  }
}
