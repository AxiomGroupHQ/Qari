# What is left to do

Last updated 2026-10-20. Details and history: `docs/tracker.md`, `docs/features.md`, `docs/credentials-and-setup.md`.

## Needs the owner

- Android `assetlinks.json`: add the SHA-256 of the Android signing key. Until then Android app links do not verify.
- Google sign-in: add the three OAuth client IDs (`GOOGLE_CLIENT_IDS` on the Worker plus the app config, section 3 of `docs/credentials-and-setup.md`). Sign-in stays off until then.
- New iOS and Android builds: needed for `expo-secure-store`, the native Google sign-in library swap, the Android widget and the CarPlay groundwork.
- Web deploys: Cloudflare auto-builds are paused since 2026-10-18. The 2026-10-19 web version was deployed by hand. Future merges need a manual deploy or unpausing the builds.
- Store presence: the real App Store ID and Play listing for Rate app, and a support page or contact address for the hidden Support links.
- Legal pages: `data/legal/*.json` is English only (reviewed and accepted 2026-10-18); translate when wanted.
- Native-speaker review of the 59 machine-translated languages. Most in need: Bambara, Mandinka, Fula, Wolof, Oromo, Tigrinya, Yoruba.
- Recitation audio still streams from mp3quran.net. Self-hosting needs R2 and a storage plan.
- Workflow files: em dashes in `.github/workflows` and the name of `inventory-quran-audio.yml` need a token with workflow scope.
- `BAYAAN_*` env and secret names in CI and Cloudflare: rename to `ISTIMA_*` when convenient.

## Open engineering

- Verify the `/p/<id>` share preview (`edge/previewWorker.ts`) in a real chat app; not checked yet.
- `/quran/[surah]` routes are stubs that redirect to Home. They exist for Android App Link autoverification; a standalone Quran reader would replace them.
- Device checks still missing: Discover feed, share sheet, `/p/<id>` screen, Android Quick Surah widget, Adhkar tab, header gear, light-mode Home fills.
- Test sync end to end on devices (settings, favorites, playlists, annotations, adhkar, listening position).
- Plural counts ("N recitations") use one wording for every plural form.

## Parked

- CarPlay / Android Auto screens (Apple entitlement, native package, head unit testing).
- iOS widgets, Watch app, TV apps.
- Merged mini + full player and analytics: skipped by the owner.
