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

Rules:
- Religious text (duas, dhikr, translations, transliterations) is translated
  by humans, never machine-translated.
- Files are sparse: any missing dhikr id or field falls back to the English
  text in the seeded adhkar database, so a partial file is safe to ship.
- Register each file in `services/adhkar/dhikrTranslations.ts`
  (`registerDhikrTranslationBundle`) for it to take effect.
