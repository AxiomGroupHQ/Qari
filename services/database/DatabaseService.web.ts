export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  surahId: string;
  reciterId: string;
  rewayatId?: string;
  orderIndex: number;
  addedAt: number;
  userRecitationId?: string;
}

class DatabaseService {
  private playlists = new Map<string, UserPlaylist>();
  private items = new Map<string, PlaylistItem>();

  async initialize(): Promise<void> {}

  async createPlaylist(playlist: Omit<UserPlaylist, 'itemCount'>): Promise<void> {
    this.playlists.set(playlist.id, {...playlist, itemCount: 0});
  }

  async getAllPlaylists(): Promise<UserPlaylist[]> {
    return [...this.playlists.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getPlaylist(id: string): Promise<UserPlaylist | null> {
    return this.playlists.get(id) ?? null;
  }

  async updatePlaylist(id: string, updates: Partial<UserPlaylist>): Promise<void> {
    const current = this.playlists.get(id);
    if (!current) return;
    this.playlists.set(id, {...current, ...updates});
  }

  async deletePlaylist(id: string): Promise<void> {
    this.playlists.delete(id);
    for (const [itemId, item] of this.items) {
      if (item.playlistId === id) this.items.delete(itemId);
    }
  }

  async addPlaylistItem(item: PlaylistItem): Promise<void> {
    this.items.set(item.id, item);
    const playlist = this.playlists.get(item.playlistId);
    if (playlist) {
      this.playlists.set(item.playlistId, {
        ...playlist,
        itemCount: [...this.items.values()].filter(x => x.playlistId === item.playlistId).length,
        updatedAt: Date.now(),
      });
    }
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return [...this.items.values()]
      .filter(item => item.playlistId === playlistId)
      .sort((a, b) => b.orderIndex - a.orderIndex);
  }

  async removePlaylistItem(itemId: string): Promise<void> {
    const item = this.items.get(itemId);
    this.items.delete(itemId);
    if (item) {
      const playlist = this.playlists.get(item.playlistId);
      if (playlist) {
        this.playlists.set(item.playlistId, {
          ...playlist,
          itemCount: [...this.items.values()].filter(x => x.playlistId === item.playlistId).length,
          updatedAt: Date.now(),
        });
      }
    }
  }

  async reorderPlaylistItems(playlistId: string, itemIds: string[]): Promise<void> {
    itemIds.forEach((itemId, index) => {
      const item = this.items.get(itemId);
      if (item && item.playlistId === playlistId) {
        this.items.set(itemId, {...item, orderIndex: index});
      }
    });
  }

  async getNextOrderIndex(playlistId: string): Promise<number> {
    const items = [...this.items.values()].filter(item => item.playlistId === playlistId);
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.orderIndex)) + 1;
  }

  async close(): Promise<void> {}
}

export const databaseService = new DatabaseService();
