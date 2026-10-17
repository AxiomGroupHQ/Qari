# Adhkar translations

Per-language translations of dhikr body text (`translation`, `instruction`),
keyed by dhikr id:

```json
{
  "75": {
    "translation": "...",
    "instruction": "..."
  }
}
```

Rules (owner decision, Oct 2026):
- Human translations are preferred. A human-sourced file ships only after
  the team confirms the source and its license/permission.
- Languages with no approved human source may ship a machine-translated
  file. Every machine-translated file has a sibling `<locale>.meta.json`
  with `"machineTranslated": true` and `"reviewed": false`; treat the text
  as a stopgap until a reviewed human translation replaces it.
- Quran, tafsir and Arabic text are never machine-translated or altered.
- Files are sparse: any missing dhikr id or field falls back to the English
  text in the seeded adhkar database, so a partial file is safe to ship.
- Register each file in `services/adhkar/dhikrTranslations.ts`
  (`registerDhikrTranslationBundle` via `bundleLoaders`) for it to take
  effect. Regional locales fall back to the base language (`nl-BE` -> `nl`).

Machine-authored bundles record their engine in the sibling meta file
(`"engine": "bing"` or `"engine": "model-authored"`).
