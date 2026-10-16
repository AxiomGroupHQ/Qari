# Istima features and roadmap

One-page requirements view . Status as of October 2026. Every feature must work on web, iOS and Android. Quran text, translations, tafsir, duas and adhkar text are never altered. Item-level status lives in `docs/tracker.md`.

## Shipped

| Feature | Functional | Non-functional |
| --- | --- | --- |
| Recitation playback | P0 Browse reciters and surahs, play, queue, repeat, shuffle, background play. | P0 Same behaviour on web, iOS, Android. |
| Downloads | P0 Save surahs for offline. P0 Downloads stay listed offline with reciter name and image (saved with each download). | P1 Old downloads are filled in automatically. |
| Languages | P0 UI in 60 languages, real RTL for ar, ur, fa, prs, ps, ug, ckb. | P0 Plural rules per language. |
| Accounts and sync | P0 Email sign-in, settings, favorites, play counts sync, account deletion. | P0 Own Worker and D1 database. |
| Intro and outro clip | P1 Intro before each surah, outro after surahs over 3 minutes. | P1 Skips languages without a clean voice. |
| Themes | P0 Dark is the default. Existing Auto users move to Dark once. | P1 Light and Auto remain selectable. |
| Share links | P1 Share buttons for reciter, recitation, surah, verse, mushaf, adhkar produce `https://istima.app/...`. P1 iOS and Android open the app from these links. | P2 Android needs the signing SHA-256 for `assetlinks.json`. |
| Web app | P0 Full app at istima.app. | P1 Static site. |

## Roadmap

| Priority | Feature | Blocked by | What she must provide |
| --- | --- | --- | --- |
| P1 | Android app links (#117) | Signing key fingerprint | SHA-256 from Play Console App signing or EAS credentials. |
| Skipped | Merged mini and full player (#74) | Skipped by owner | A device or simulator test loop. |
| P2 | Playlist share links and rich previews (#117) | Built, not deployed | Shared playlists stored in D1 (public by link), preview tags added by an edge worker. Flag: `sharedPlaylists`. Needs the API migration and worker deploy. |
| Skipped | Listening insights (#119) | Skipped by owner | What to show, and whether to use PostHog (privacy policy change). |
| P2 | Android performance (#133) | Device testing | A real Android device for list tuning and R8. |
| P3 | CarPlay and Android Auto (#115) | Platform approval | Apple CarPlay audio entitlement, Google Play review. |
| P3 | Home widgets (#126) | Android first widget built, iOS pending | Android Quick Surah widget is in the repo, not yet compiled on a device. iOS needs Apple Developer access (App Group, target). Watch and TV apps pending. |
| P3 | Watch apps (#118), TV apps (#116) | Native targets, provisioning | Apple Developer access, store setup, devices. |
| P3 | Discover feed (#8) | Built, flag on | Random ayah feed from existing timed recitations. Strings translated. Still needs a device check. |

Not applicable: #242 (dev builds only), #323 (no Quran Foundation sync), #62 (audio is not hosted by Istima).
