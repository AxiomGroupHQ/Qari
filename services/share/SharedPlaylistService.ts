import branding from '@/config/branding';

export interface SharedItem {
  surahId: string;
  reciterId: string;
  rewayatId?: string;
}

export interface SharedPlaylist {
  id: string;
  name: string;
  items: SharedItem[];
  createdAt: number;
}

export type ShareError = 'empty' | 'rate_limited' | 'network' | 'not_found';

export class SharedPlaylistError extends Error {
  constructor(public code: ShareError) {
    super(code);
  }
}

const base = (): string => `${branding.apiBaseUrl}/v1/share/playlist`;

/** Uploads a playlist and returns the id used in https://<share domain>/p/<id>. */
export async function createSharedPlaylist(
  name: string,
  items: SharedItem[],
): Promise<string> {
  if (items.length === 0) throw new SharedPlaylistError('empty');
  let res: Response;
  try {
    res = await fetch(base(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, items}),
    });
  } catch {
    throw new SharedPlaylistError('network');
  }
  if (res.status === 429) throw new SharedPlaylistError('rate_limited');
  if (!res.ok) throw new SharedPlaylistError('network');
  const body = (await res.json()) as {id?: string};
  if (!body.id) throw new SharedPlaylistError('network');
  return body.id;
}

export async function fetchSharedPlaylist(id: string): Promise<SharedPlaylist> {
  let res: Response;
  try {
    res = await fetch(`${base()}/${encodeURIComponent(id)}`);
  } catch {
    throw new SharedPlaylistError('network');
  }
  if (res.status === 404) throw new SharedPlaylistError('not_found');
  if (!res.ok) throw new SharedPlaylistError('network');
  return (await res.json()) as SharedPlaylist;
}
