# Accounts: what is saved to the database

Sync stores a small JSON document per user in D1 (one row per document key). Language is never synced (per device).

## Rule: a valid email is needed to store personal data
No verification email is sent. Registration requires a well-formed address whose domain can receive mail (MX or A record, checked server side). Google accounts arrive with a Google-verified email. Without an account, all data stays on the device and nothing is stored on the server. The account screen says so.

## Already built
| Doc key | Local storage keys | Status |
|---|---|---|
| settings | theme-storage, mushaf-settings, adhkar-settings | built |
| favorites | favoriteReciters, favoriteRecitersTimestamps | built |
| playcounts | play-count-storage | built |

## Server accepts, app adapter still to build
playlists, annotations (verse annotations), adhkar (saved), position (last track and position: `@bayaan/last_track`, `@bayaan/last_position`).

## Audit: recommended additions
Add to the save list:
- **Loved tracks** (`loved-tracks-store`): the user's liked surahs and tracks. Same kind of data as favorites.
- **Player favorite reciters** (`player-favorite-reciters-storage`): a second favorites store in the player. Merge with `favorites`.
- **Selected reciter and rewayah** (`reciter-storage`): the reciter the user picked.
- **Player preferences** (`player-store`, `mushaf-player-store`): playback speed, repeat, last mushaf position. Resume point goes in `position`.
- **Tafseer and translation choices** (`tafseer-store`): chosen tafseer and settings.
- **Reading goal and khatmah progress** (`analytics:goal`, `analytics:khatmah:current`): progress would be lost on a new device.
- **Recently played** (`player-recently-played-storage`): optional, small, capped list.
- **General settings** (`settings-storage`): fold into `settings`.

Keep device-only (do not sync):
- Downloads (`downloads-store`) and uploaded recitations: large files, tied to the device. Uploads would need object storage (R2) and a separate decision.
- Language (`istima-language`), dev settings, ambient sound store, catalog version, device id, upload orphan check, API health and network state.
- Search history (`recentSearches`, `mushaf-search-history`): low value, privacy-sensitive. Skip unless she wants it.

Free-tier note: all of the above is a few KB per user, well inside D1 and Workers free limits.
