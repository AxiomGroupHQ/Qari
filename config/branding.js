// @ai-start
/**
 * ISTIMA app identity config.
 *
 * CJS (not ESM) — app.config.js calls require() before Expo CLI transpiles.
 * Forks override by replacing this file; the shape is typed in branding.d.ts.
 *
 * See docs/rfcs/007-app-layer-multi-tenancy.md for the design rationale.
 */
module.exports = {
  appName: 'Istima',
  arabicName: 'استماع',
  contentTagline: 'Quran • Bayan • Tafsir • Knowledge',
  reflectionTagline: 'Listen. Reflect. Remember Allah.',
  websiteUrl: 'https://istima.app',
  appSlug: 'istima',
  urlScheme: 'istima',
  bundleId: {
    ios: 'com.istima.app',
    android: 'com.istima.app',
  },
  supportUrl: 'https://github.com/AxiomGroupHQ/Qari/issues',
  termsUrl: 'https://istima.app/terms',
  privacyUrl: 'https://istima.app/privacy',
  shareBaseUrl: 'https://istima.app',
  emailProductName: 'Istima',
  catalog: {
    source: 'bundled',
    fallbackPath: undefined,
  },
  /**
   * Order + visibility of Listen-tab home rows. Istima's default mirrors
   * the historical hardcoded order in RecitersView.tsx for parity. Forks
   * override this to reorder, hide, or omit rows entirely.
   */
  homeRowConfig: [
    {id: 'continue-listening', enabled: true},
    {id: 'new-to-quran', enabled: true},
    {id: 'favorites', enabled: true},
    {id: 'featured', enabled: true},
    {id: 'adhkar', enabled: true},
    {id: 'follow-along', enabled: true},
    {id: 'playlists', enabled: true},
    {id: 'exclusives', enabled: true},
    {id: 'tajweed', enabled: true},
    {id: 'memorization', enabled: true},
    {id: 'rewayat', enabled: true},
    {id: 'collection', enabled: true},
  ],
};

// @ai-end
