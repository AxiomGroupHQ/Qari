import type {RewayahId} from '@/store/mushafSettingsStore';

export const BASMALLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export interface DKLine {
  page_number: number;
  line_number: number;
  line_type: 'surah_name' | 'basmallah' | 'ayah';
  is_centered: 0 | 1;
  first_word_id: number;
  last_word_id: number;
  surah_number: number;
}

export interface DKWordInfo {
  text: string;
  verseKey: string;
  wordPositionInVerse: number;
}

class DigitalKhattDataServiceWeb {
  get initialized(): boolean {
    return false;
  }

  get rewayah(): RewayahId {
    return 'hafs';
  }

  onRewayahChange(): () => void {
    return () => {};
  }

  subscribeCacheChanges = (): (() => void) => () => {};
  getCacheVersion = (): number => 0;

  async initialize(): Promise<void> {}
  async resetDatabases(): Promise<void> {}
  async switchRewayah(): Promise<void> {}
  async ensureRewayahLoaded(): Promise<void> {}

  getRewayahFontFamily(): string | null {
    return null;
  }

  getSurahStartPages(): Record<number, number> {
    return {};
  }

  getPageForVerse(): number | undefined {
    return undefined;
  }

  getPageLines(): DKLine[] {
    return [];
  }

  getWordText(): string | undefined {
    return undefined;
  }

  getWordInfo(): DKWordInfo | undefined {
    return undefined;
  }

  getVerseWords(): DKWordInfo[] {
    return [];
  }

  getVerseText(): string {
    return '';
  }
}

export function getRewayahFontFamily(_rewayah: RewayahId): string | null {
  return null;
}

export const digitalKhattDataService = new DigitalKhattDataServiceWeb();
export default digitalKhattDataService;
