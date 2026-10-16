import {
  createSharedPlaylist,
  fetchSharedPlaylist,
} from '../SharedPlaylistService';

const mockFetch = (res: Partial<Response> | Error) => {
  (global as unknown as {fetch: jest.Mock}).fetch = jest.fn(() =>
    res instanceof Error ? Promise.reject(res) : Promise.resolve(res),
  );
};

describe('SharedPlaylistService', () => {
  it('creates a share and returns the id', async () => {
    mockFetch({ok: true, status: 201, json: async () => ({id: 'abc123xyz9'})});
    await expect(
      createSharedPlaylist('Friday', [{surahId: '18', reciterId: 'r1'}]),
    ).resolves.toBe('abc123xyz9');
  });
  it('refuses an empty playlist without calling the network', async () => {
    mockFetch({ok: true, status: 201, json: async () => ({id: 'x'})});
    await expect(createSharedPlaylist('x', [])).rejects.toMatchObject({
      code: 'empty',
    });
    expect(
      (global as unknown as {fetch: jest.Mock}).fetch,
    ).not.toHaveBeenCalled();
  });
  it('maps 429 and network failures', async () => {
    mockFetch({ok: false, status: 429});
    await expect(
      createSharedPlaylist('x', [{surahId: '1', reciterId: 'r'}]),
    ).rejects.toMatchObject({code: 'rate_limited'});
    mockFetch(new Error('offline'));
    await expect(
      createSharedPlaylist('x', [{surahId: '1', reciterId: 'r'}]),
    ).rejects.toMatchObject({code: 'network'});
  });
  it('fetches and maps 404', async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: async () => ({id: 'a', name: 'n', items: [], createdAt: 1}),
    });
    await expect(fetchSharedPlaylist('a')).resolves.toMatchObject({name: 'n'});
    mockFetch({ok: false, status: 404});
    await expect(fetchSharedPlaylist('zz')).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});
