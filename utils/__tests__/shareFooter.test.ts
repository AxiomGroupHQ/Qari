import {Platform, Share} from 'react-native';
import {playlistShareUrl, shareUrl} from '../shareUtils';
import {SHARE_FOOTER} from '../shareFooter';

jest.mock('@/services/analytics/AnalyticsService', () => ({
  analyticsService: {trackShareCreated: jest.fn()},
}));

describe('share footer on playlist shares', () => {
  it('adds the standard footer to a playlist share on native', async () => {
    (Platform as {OS: string}).OS = 'android';
    const spy = jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'sharedAction',
    } as never);
    await shareUrl(playlistShareUrl('abc123'), 'My playlist');
    const message = (spy.mock.calls[0][0] as {message: string}).message;
    expect(message).toContain('/p/abc123');
    expect(message.endsWith(SHARE_FOOTER)).toBe(true);
  });
});
