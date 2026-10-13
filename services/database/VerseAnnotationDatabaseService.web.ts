import type {
  VerseBookmark,
  VerseNote,
  VerseHighlight,
  HighlightColor,
} from '@/types/verse-annotations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

class VerseAnnotationDatabaseServiceWeb {
  private bookmarks = new Map<string, VerseBookmark>();
  private notes = new Map<string, VerseNote>();
  private highlights = new Map<string, VerseHighlight>();

  async initialize(): Promise<void> {}

  async addBookmark(
    verseKey: string,
    surahNumber: number,
    ayahNumber: number,
    rewayahId?: string,
  ): Promise<VerseBookmark> {
    const bookmark: VerseBookmark = {
      id: generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      createdAt: Date.now(),
      rewayahId: rewayahId as VerseBookmark['rewayahId'],
    };
    this.bookmarks.set(verseKey, bookmark);
    return bookmark;
  }

  async removeBookmark(verseKey: string): Promise<void> {
    this.bookmarks.delete(verseKey);
  }

  async getBookmarksBySurah(surahNumber: number): Promise<VerseBookmark[]> {
    return [...this.bookmarks.values()]
      .filter(item => item.surahNumber === surahNumber)
      .sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  async getAllBookmarks(): Promise<VerseBookmark[]> {
    return [...this.bookmarks.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  async isBookmarked(verseKey: string): Promise<boolean> {
    return this.bookmarks.has(verseKey);
  }

  async addNote(
    verseKey: string,
    surahNumber: number,
    ayahNumber: number,
    content: string,
    verseKeys?: string[],
    rewayahId?: string,
  ): Promise<VerseNote> {
    const now = Date.now();
    const note: VerseNote = {
      id: generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      content,
      verseKeys: verseKeys?.length ? verseKeys : undefined,
      createdAt: now,
      updatedAt: now,
      rewayahId: rewayahId as VerseNote['rewayahId'],
    };
    this.notes.set(note.id, note);
    return note;
  }

  async updateNote(noteId: string, content: string): Promise<void> {
    const note = this.notes.get(noteId);
    if (!note) return;
    this.notes.set(noteId, {...note, content, updatedAt: Date.now()});
  }

  async getNoteById(noteId: string): Promise<VerseNote | null> {
    return this.notes.get(noteId) ?? null;
  }

  async getNotesForVerse(verseKey: string): Promise<VerseNote[]> {
    return [...this.notes.values()]
      .filter(note => note.verseKey === verseKey || note.verseKeys?.includes(verseKey))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteNoteById(noteId: string): Promise<void> {
    this.notes.delete(noteId);
  }

  async getNotesCountForVerse(verseKey: string): Promise<number> {
    return (await this.getNotesForVerse(verseKey)).length;
  }

  async getAllNotes(): Promise<VerseNote[]> {
    return [...this.notes.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getNotesBySurah(surahNumber: number): Promise<VerseNote[]> {
    return [...this.notes.values()]
      .filter(note => note.surahNumber === surahNumber)
      .sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  async upsertHighlight(
    verseKey: string,
    surahNumber: number,
    ayahNumber: number,
    color: HighlightColor,
    rewayahId?: string,
  ): Promise<VerseHighlight> {
    const existing = this.highlights.get(verseKey);
    const highlight: VerseHighlight = {
      id: existing?.id ?? generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      color,
      createdAt: existing?.createdAt ?? Date.now(),
      rewayahId: rewayahId as VerseHighlight['rewayahId'],
    };
    this.highlights.set(verseKey, highlight);
    return highlight;
  }

  async removeHighlight(verseKey: string): Promise<void> {
    this.highlights.delete(verseKey);
  }

  async getHighlightsBySurah(surahNumber: number): Promise<VerseHighlight[]> {
    return [...this.highlights.values()]
      .filter(item => item.surahNumber === surahNumber)
      .sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  async getAnnotationsForSurah(surahNumber: number): Promise<{
    bookmarks: VerseBookmark[];
    notes: VerseNote[];
    highlights: VerseHighlight[];
  }> {
    const [bookmarks, notes, highlights] = await Promise.all([
      this.getBookmarksBySurah(surahNumber),
      this.getNotesBySurah(surahNumber),
      this.getHighlightsBySurah(surahNumber),
    ]);
    return {bookmarks, notes, highlights};
  }
}

export const verseAnnotationDatabaseService =
  new VerseAnnotationDatabaseServiceWeb();
