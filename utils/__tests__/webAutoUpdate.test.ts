import {extractEntryBundle} from '../webAutoUpdate.web';

describe('extractEntryBundle', () => {
  it('extracts the hashed entry bundle path from served HTML', () => {
    const html =
      '<html><head></head><body><script src="/_expo/static/js/web/qari-entry-ef03a82414e6e88b7303b410eb290fac.js" defer></script></body></html>';
    expect(extractEntryBundle(html)).toBe(
      '/_expo/static/js/web/qari-entry-ef03a82414e6e88b7303b410eb290fac.js',
    );
  });

  it('returns null when the shell references no entry bundle', () => {
    expect(extractEntryBundle('<html><body>oops</body></html>')).toBeNull();
  });

  it('ignores non-entry hashed assets', () => {
    const html =
      '<script src="/_expo/static/js/web/other-9bac34d1f7c3cd2931a11f25949fb5e0.js"></script>';
    expect(extractEntryBundle(html)).toBeNull();
  });
});
