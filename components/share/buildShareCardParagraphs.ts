/**
 * Builds Skia paragraph objects for the share card - reused by both the
 * preview Canvas and the offscreen capture path.
 */
import {
  Skia,
  FontSlant,
  TextDirection,
  TextAlign,
  type SkTypefaceFontProvider,
  type SkParagraph,
  type SkTypeface,
} from '@shopify/react-native-skia';
import {
  CARD_CONTENT_WIDTH,
  CARD_VERSE_FONT_SIZE,
  CARD_WATERMARK_FONT_SIZE,
  CARD_WATERMARK_ICON_SIZE,
  CARD_WATERMARK_GAP,
  CARD_VERSE_LINE_HEIGHT,
  CARD_TOP_PADDING,
  CARD_VERSE_BOTTOM_GAP,
  CARD_BOTTOM_PADDING,
  CARD_SURAH_GAP,
  CARD_BASMALLAH_FONT_SIZE,
  CARD_BASMALLAH_BOTTOM_GAP,
  CARD_TRANSLIT_FONT_SIZE,
  CARD_TRANSLATION_FONT_SIZE,
  CARD_REFERENCE_FONT_SIZE,
  CARD_BLOCK_GAP,
  CARD_ACCENT_COLOR,
  LIGHT_COLORS,
  DARK_COLORS,
  type ShareCardColors,
} from './shareCardConstants';
import {
  BASMALLAH_TEXT,
  digitalKhattDataService,
} from '@/services/mushaf/DigitalKhattDataService';
import {getRewayahShortLabel} from '@/utils/rewayahLabels';
import {footerLockup} from './shareFooterLayout';
import type {RewayahId} from '@/store/mushafSettingsStore';
import branding from '@/config/branding';

interface QuranEntry {
  verse_key: string;
  text: string;
}
const quranRaw = require('@/data/quran.json') as Record<string, QuranEntry>;
const textByKey: Record<string, string> = {};
for (const key of Object.keys(quranRaw)) {
  const entry = quranRaw[key];
  if (entry?.verse_key) textByKey[entry.verse_key] = entry.text;
}

interface TextEntry {
  t?: string;
}
const translitRaw = require('@/data/transliteration.json') as Record<
  string,
  TextEntry
>;
const translationRaw =
  require('@/data/SaheehInternational.translation-with-footnote-tags.json') as Record<
    string,
    TextEntry
  >;
const surahMeta = require('@/data/surahData.json') as Array<{
  id: number;
  name: string;
  name_arabic: string;
}>;

const stripTags = (v: string) => v.replace(/<[^>]*>/g, '').trim();

/** Card reference line, e.g. "An-Naml (النمل) | Al-Quran 27:26" or "...27:26-28". */
function referenceLine(surahNumber: number, verseKeys: string[]): string {
  const meta = surahMeta.find(m => m.id === surahNumber);
  const first = verseKeys[0].split(':')[1];
  const last = verseKeys[verseKeys.length - 1].split(':')[1];
  const range = first === last ? first : `${first}-${last}`;
  const name = meta ? `${meta.name} (${meta.name_arabic})` : '';
  return `${name} | Al-Quran ${surahNumber}:${range}`;
}

// Reference coordinate system constants (from DigitalKhatt / QuranTextService)
const FONTSIZE = 1000;
const SPACEWIDTH = 100;

/** One visual section in the card (header + its verse text). */
interface SurahSection {
  surahNumber: number;
  verseKeys: string[];
  verseTexts: string[];
}

export interface ShareCardElements {
  /** Sections: each is a surah header + optional basmallah + verse text paragraph */
  /** Small basmala centered at the top of the card. */
  basmallahParagraph: SkParagraph | null;
  basmallahHeight: number;
  /** Sections: Arabic verse text, transliteration, translation and reference line. */
  sections: Array<{
    surahNumber: number;
    verseParagraph: SkParagraph;
    verseHeight: number;
    transliterationParagraph: SkParagraph | null;
    transliterationHeight: number;
    translationParagraph: SkParagraph | null;
    translationHeight: number;
    referenceParagraph: SkParagraph;
    referenceHeight: number;
  }>;
  watermarkParagraph: SkParagraph | null;
  watermarkHeight: number;
  watermarkTextWidth: number;
  watermarkIconSize: number;
  watermarkGap: number;
  /** Rendered only when rewayah !== 'hafs' - small label disclosing the
   *  reading on the share card so recipients can tell which text they're
   *  seeing. Rendered centered, above the watermark. */
  rewayahLabelParagraph: SkParagraph | null;
  rewayahLabelHeight: number;
  totalHeight: number;
  colors: ShareCardColors;
}

/** Group verse keys by surah number, preserving order. */
function groupBySurah(
  verseKeys: string[],
  rewayah: RewayahId | undefined,
): SurahSection[] {
  const sections: SurahSection[] = [];
  let current: SurahSection | null = null;

  for (const vk of verseKeys) {
    const [surahStr] = vk.split(':');
    const surahNumber = parseInt(surahStr, 10);
    // Prefer DK text for the active rewayah so the rendered share card
    // matches what the user is reading. Fall back to the static Hafs JSON
    // for verses DK doesn't cover yet.
    const text =
      digitalKhattDataService.getVerseText(vk, rewayah) || textByKey[vk] || '';

    if (!current || current.surahNumber !== surahNumber) {
      current = {surahNumber, verseKeys: [], verseTexts: []};
      sections.push(current);
    }
    current.verseKeys.push(vk);
    if (text) current.verseTexts.push(text);
  }
  return sections;
}

/** Prepend U+06DD (Arabic End of Ayah) before trailing Arabic-Indic digits. */
function addVerseMarker(text: string): string {
  // If a U+06DD (end-of-ayah) is already adjacent to the trailing digits,
  // don't re-prefix. DK text concatenated from the words DB includes the
  // marker word (e.g. "...۝١"), and newer Quran JSON sources do too -
  // blindly prefixing would produce a double marker like "...۝۝١" which
  // renders as two empty circles with the number after them.
  if (/\u06DD\s*[\u0660-\u0669]+$/.test(text)) return text;
  return text.replace(/([\u0660-\u0669]+)$/, '\u06DD$1');
}

export function buildShareCardParagraphs(
  verseKeys: string[],
  contentWidth: number,
  fontMgr: SkTypefaceFontProvider,
  isDarkMode: boolean,
  showWatermark: boolean,
  quranCommonTypeface: SkTypeface | null,
  fontFamily: string,
  showBasmallah: boolean,
  rewayah?: RewayahId,
): ShareCardElements {
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  const scale = contentWidth / CARD_CONTENT_WIDTH;
  const verseFontSize = CARD_VERSE_FONT_SIZE * scale;
  const watermarkFontSize = CARD_WATERMARK_FONT_SIZE * scale;
  const topPadding = CARD_TOP_PADDING * scale;
  const verseBottomGap = CARD_VERSE_BOTTOM_GAP * scale;
  const bottomPadding = CARD_BOTTOM_PADDING * scale;
  const surahGap = CARD_SURAH_GAP * scale;

  const groups = groupBySurah(verseKeys, rewayah);

  // Build sections
  const sections = groups.map(group => {
    // Verse text paragraph
    const verseBuilder = Skia.ParagraphBuilder.Make(
      {textDirection: TextDirection.RTL, textAlign: TextAlign.Center},
      fontMgr,
    );

    const color = Skia.Color(colors.text);
    const textStyle = {
      color,
      fontFamilies: [fontFamily],
      fontSize: verseFontSize,
    };

    const allVerseText = group.verseTexts.map(addVerseMarker).join(' ');
    const fontScale = verseFontSize / FONTSIZE;
    const ayaLetterSpacing = SPACEWIDTH * fontScale;

    // Base push: includes heightMultiplier for line spacing (only here).
    verseBuilder.pushStyle({
      ...textStyle,
      heightMultiplier: CARD_VERSE_LINE_HEIGHT,
    });

    for (let i = 0; i < allVerseText.length; i++) {
      const char = allVerseText.charAt(i);

      if (char === ' ') {
        // Classify space - aya space: adjacent to Arabic-Indic digit or ۝
        const prevCode = i > 0 ? allVerseText.charCodeAt(i - 1) : 0;
        const nextCode =
          i < allVerseText.length - 1 ? allVerseText.charCodeAt(i + 1) : 0;
        const isAyaSpace =
          (prevCode >= 0x0660 && prevCode <= 0x0669) || nextCode === 0x06dd;

        if (isAyaSpace) {
          verseBuilder.pushStyle({
            ...textStyle,
            letterSpacing: ayaLetterSpacing,
          });
        } else {
          verseBuilder.pushStyle({...textStyle, letterSpacing: 0});
        }
        verseBuilder.addText(' ');
        verseBuilder.pop();
      } else {
        verseBuilder.addText(char);
      }
    }

    verseBuilder.pop(); // pop base style
    const verseParagraph = verseBuilder.build();
    verseParagraph.layout(contentWidth);
    const verseHeight = verseParagraph.getHeight();

    const textBlock = (
      text: string,
      family: string,
      size: number,
      textColor: string,
      italic: boolean,
      lineHeight: number,
    ): SkParagraph | null => {
      if (!text) return null;
      const b = Skia.ParagraphBuilder.Make(
        {textAlign: TextAlign.Center},
        fontMgr,
      );
      b.pushStyle({
        color: Skia.Color(textColor),
        // Fall back to the Quran font for Arabic glyphs (Manrope is Latin only).
        fontFamilies: [family, fontFamily],
        fontSize: size,
        heightMultiplier: lineHeight,
        ...(italic ? {fontStyle: {slant: FontSlant.Italic}} : {}),
      });
      b.addText(text);
      b.pop();
      const para = b.build();
      para.layout(contentWidth);
      return para;
    };

    const transliterationText = group.verseKeys
      .map(vk => stripTags(translitRaw[vk]?.t ?? ''))
      .filter(Boolean)
      .join(' ');
    const translationText = group.verseKeys
      .map(vk => stripTags(translationRaw[vk]?.t ?? ''))
      .filter(Boolean)
      .join(' ');

    const transliterationParagraph = textBlock(
      transliterationText,
      'ManropeRegular',
      CARD_TRANSLIT_FONT_SIZE * scale,
      colors.secondary,
      true,
      1.45,
    );
    const translationParagraph = textBlock(
      translationText,
      'ManropeRegular',
      CARD_TRANSLATION_FONT_SIZE * scale,
      colors.text,
      false,
      1.45,
    );
    const referenceParagraph = textBlock(
      referenceLine(group.surahNumber, group.verseKeys),
      'ManropeSemiBold',
      CARD_REFERENCE_FONT_SIZE * scale,
      CARD_ACCENT_COLOR,
      false,
      1.3,
    ) as SkParagraph;

    return {
      surahNumber: group.surahNumber,
      verseParagraph,
      verseHeight,
      transliterationParagraph,
      transliterationHeight: transliterationParagraph?.getHeight() ?? 0,
      translationParagraph,
      translationHeight: translationParagraph?.getHeight() ?? 0,
      referenceParagraph,
      referenceHeight: referenceParagraph.getHeight(),
    };
  });

  // Small basmala at the top of the card (always shown, as on the Ayah a Day card).
  let basmallahParagraph: SkParagraph | null = null;
  let basmallahHeight = 0;
  if (BASMALLAH_TEXT) {
    const basmBuilder = Skia.ParagraphBuilder.Make(
      {textDirection: TextDirection.RTL, textAlign: TextAlign.Center},
      fontMgr,
    );
    basmBuilder.pushStyle({
      color: Skia.Color(CARD_ACCENT_COLOR),
      fontFamilies: [fontFamily],
      fontSize: CARD_BASMALLAH_FONT_SIZE * scale,
      fontFeatures: [{name: 'basm', value: 1}],
    });
    basmBuilder.addText(BASMALLAH_TEXT);
    basmBuilder.pop();
    basmallahParagraph = basmBuilder.build();
    basmallahParagraph.layout(contentWidth);
    basmallahHeight = basmallahParagraph.getHeight();
  }

  // Rewayah disclosure label (only when non-Hafs). Rendered centered, above
  // the watermark, so the share card makes the reading explicit.
  let rewayahLabelParagraph: SkParagraph | null = null;
  let rewayahLabelHeight = 0;
  if (rewayah && rewayah !== 'hafs') {
    const labelBuilder = Skia.ParagraphBuilder.Make(
      {textAlign: TextAlign.Center},
      fontMgr,
    );
    labelBuilder.pushStyle({
      color: Skia.Color(colors.secondary),
      fontFamilies: ['ManropeSemiBold'],
      fontSize: watermarkFontSize,
    });
    labelBuilder.addText(getRewayahShortLabel(rewayah));
    labelBuilder.pop();
    rewayahLabelParagraph = labelBuilder.build();
    rewayahLabelParagraph.layout(contentWidth);
    rewayahLabelHeight = rewayahLabelParagraph.getHeight();
  }

  // Watermark: logo + "made with {appName}" (left-aligned, manually centered in canvas)
  let watermarkParagraph: SkParagraph | null = null;
  let watermarkHeight = 0;
  let watermarkTextWidth = 0;
  const watermarkIconSize = CARD_WATERMARK_ICON_SIZE * scale;
  const watermarkGap = CARD_WATERMARK_GAP * scale;
  if (showWatermark) {
    // Footer URL, bottom-right; the logo lockup is drawn by ShareCardPreview.
    const wmBuilder = Skia.ParagraphBuilder.Make(
      {textAlign: TextAlign.Right},
      fontMgr,
    );
    wmBuilder.pushStyle({
      color: Skia.Color(colors.secondary),
      fontFamilies: ['ManropeSemiBold'],
      fontSize: watermarkFontSize,
    });
    wmBuilder.addText(branding.shareBaseUrl.replace(/^https?:\/\//, ''));
    wmBuilder.pop();
    watermarkParagraph = wmBuilder.build();
    watermarkParagraph.layout(contentWidth);
    watermarkTextWidth = contentWidth;
    watermarkHeight = Math.max(
      footerLockup(contentWidth).height,
      watermarkParagraph.getHeight(),
    );
  }

  // Compute total height
  const blockGap = CARD_BLOCK_GAP * scale;
  let totalHeight = topPadding;
  if (basmallahParagraph) {
    totalHeight += basmallahHeight + CARD_BASMALLAH_BOTTOM_GAP * scale;
  }
  sections.forEach((section, i) => {
    if (i > 0) totalHeight += surahGap;
    totalHeight += section.verseHeight + verseBottomGap;
    if (section.transliterationParagraph) {
      totalHeight += section.transliterationHeight + blockGap;
    }
    if (section.translationParagraph) {
      totalHeight += section.translationHeight + blockGap;
    }
    totalHeight += section.referenceHeight + verseBottomGap;
  });
  if (rewayahLabelParagraph) totalHeight += rewayahLabelHeight;
  if (watermarkParagraph) totalHeight += watermarkHeight;
  totalHeight += bottomPadding;

  return {
    basmallahParagraph,
    basmallahHeight,
    sections,
    watermarkParagraph,
    watermarkHeight,
    watermarkTextWidth,
    watermarkIconSize,
    watermarkGap,
    rewayahLabelParagraph,
    rewayahLabelHeight,
    totalHeight,
    colors,
  };
}
