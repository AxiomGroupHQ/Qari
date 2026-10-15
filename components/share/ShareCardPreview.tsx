import React, {useMemo} from 'react';
import {
  Canvas,
  Paragraph,
  Rect,
  Group,
  Image as SkImage,
  Skia,
  BlendMode,
  useImage,
  type SkTypefaceFontProvider,
  type SkTypeface,
} from '@shopify/react-native-skia';
import {buildShareCardParagraphs} from './buildShareCardParagraphs';
import {footerLockup, FOOTER_RULE_COLOR} from './shareFooterLayout';
import {
  CARD_CONTENT_WIDTH,
  CARD_PADDING,
  CARD_TOP_PADDING,
  CARD_BLOCK_GAP,
  CARD_ACCENT_COLOR,
  CARD_BASMALLAH_BOTTOM_GAP,
  CARD_VERSE_BOTTOM_GAP,
  CARD_SURAH_GAP,
} from './shareCardConstants';

interface ShareCardPreviewProps {
  verseKeys: string[];
  isDarkMode: boolean;
  showWatermark: boolean;
  showBasmallah: boolean;
  fontMgr: SkTypefaceFontProvider;
  quranCommonTypeface: SkTypeface | null;
  fontFamily: string;
  width: number;
  /** Optional ref forwarded to the underlying Canvas (used for image capture). */
  canvasRef?: React.RefObject<any>;
  /** Current-context rewayah. Drives which DK words DB the Arabic text is
   *  pulled from, and (when non-Hafs) surfaces a small rewayah label on the
   *  rendered card so shared images disclose the reading. */
  rewayah?: import('@/store/mushafSettingsStore').RewayahId;
}

const ShareCardPreview: React.FC<ShareCardPreviewProps> = ({
  verseKeys,
  isDarkMode,
  showWatermark,
  showBasmallah,
  fontMgr,
  quranCommonTypeface,
  fontFamily,
  width,
  canvasRef,
  rewayah,
}) => {
  const padding =
    (CARD_PADDING / (CARD_CONTENT_WIDTH + CARD_PADDING * 2)) * width;
  const contentWidth = width - padding * 2;

  const elements = useMemo(
    () =>
      buildShareCardParagraphs(
        verseKeys,
        contentWidth,
        fontMgr,
        isDarkMode,
        showWatermark,
        quranCommonTypeface,
        fontFamily,
        showBasmallah,
        rewayah,
      ),
    [
      verseKeys,
      contentWidth,
      fontMgr,
      isDarkMode,
      showWatermark,
      quranCommonTypeface,
      fontFamily,
      showBasmallah,
      rewayah,
    ],
  );

  const wordmarkImage = useImage(
    require('@/assets/branding/istima-wordmark.png'),
  );
  const halalwebImage = useImage(require('@/assets/branding/halalweb.png'));

  const scale = contentWidth / CARD_CONTENT_WIDTH;
  const naturalHeight = elements.totalHeight + padding * 2;
  // Instagram square: never shorter than the width (1080x1080 at capture size). Short verses
  // get the extra room split above the text; the footer is pinned lower. Long selections stay
  // taller than square so the text is not shrunk or cut.
  const totalHeight = Math.max(naturalHeight, width);
  const extra = totalHeight - naturalHeight;

  // QCF font has hardcoded black SVG fills — recolor with SrcIn filter
  const nameColorPaint = useMemo(() => {
    const paint = Skia.Paint();
    paint.setColorFilter(
      Skia.ColorFilter.MakeBlend(
        Skia.Color(elements.colors.text),
        BlendMode.SrcIn,
      ),
    );
    return paint;
  }, [elements.colors.text]);

  return (
    <Canvas ref={canvasRef} style={{width, height: totalHeight}}>
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={totalHeight}
        color={elements.colors.background}
      />

      {/* Thin inset border, like the Ayah a Day card */}
      <Rect
        x={padding * 0.4}
        y={padding * 0.4}
        width={width - padding * 0.8}
        height={totalHeight - padding * 0.8}
        color={CARD_ACCENT_COLOR}
        style="stroke"
        strokeWidth={Math.max(1, scale * 2)}
      />

      {/* Sections */}
      {(() => {
        let y = padding + CARD_TOP_PADDING * scale + extra * 0.4;
        const nodes: React.ReactNode[] = [];

        // Small basmala at the top
        if (elements.basmallahParagraph) {
          nodes.push(
            <Paragraph
              key="basmallah"
              paragraph={elements.basmallahParagraph}
              x={padding}
              y={y}
              width={contentWidth}
            />,
          );
          y += elements.basmallahHeight + CARD_BASMALLAH_BOTTOM_GAP * scale;
        }

        elements.sections.forEach((section, i) => {
          if (i > 0) y += CARD_SURAH_GAP * scale;

          // Arabic verse text
          nodes.push(
            <Paragraph
              key={`verse-${i}`}
              paragraph={section.verseParagraph}
              x={padding}
              y={y}
              width={contentWidth}
            />,
          );
          y += section.verseHeight + CARD_VERSE_BOTTOM_GAP * scale;

          // Transliteration (italic), then translation, then the reference line
          if (section.transliterationParagraph) {
            nodes.push(
              <Paragraph
                key={`translit-${i}`}
                paragraph={section.transliterationParagraph}
                x={padding}
                y={y}
                width={contentWidth}
              />,
            );
            y += section.transliterationHeight + CARD_BLOCK_GAP * scale;
          }
          if (section.translationParagraph) {
            nodes.push(
              <Paragraph
                key={`translation-${i}`}
                paragraph={section.translationParagraph}
                x={padding}
                y={y}
                width={contentWidth}
              />,
            );
            y += section.translationHeight + CARD_BLOCK_GAP * scale;
          }
          nodes.push(
            <Paragraph
              key={`ref-${i}`}
              paragraph={section.referenceParagraph}
              x={padding}
              y={y}
              width={contentWidth}
            />,
          );
          y += section.referenceHeight + CARD_VERSE_BOTTOM_GAP * scale;
        });

        // Rewayah disclosure label (non-Hafs only), centered above watermark.
        if (elements.rewayahLabelParagraph) {
          nodes.push(
            <Paragraph
              key="rewayah-label"
              paragraph={elements.rewayahLabelParagraph}
              x={padding}
              y={y}
              width={contentWidth}
            />,
          );
          y += elements.rewayahLabelHeight;
        }

        // Footer: ISTIMA wordmark, gold rule and Halalweb (centered), with the
        // site URL at the bottom-right.
        if (elements.watermarkParagraph) {
          // Push the footer lockup down into the spare square space.
          y += extra * 0.6;
          const lockup = footerLockup(contentWidth);
          const centerX = padding + contentWidth / 2;
          const markX = centerX - lockup.markW / 2;
          const ruleY = y + lockup.markH + lockup.gapTop;
          const halalY = ruleY + lockup.ruleH + lockup.gapBottom;
          if (wordmarkImage) {
            nodes.push(
              <Group key="wordmark" layer={nameColorPaint}>
                <SkImage
                  image={wordmarkImage}
                  x={markX}
                  y={y}
                  width={lockup.markW}
                  height={lockup.markH}
                  fit="contain"
                />
              </Group>,
            );
          }
          nodes.push(
            <Rect
              key="rule"
              x={markX}
              y={ruleY}
              width={lockup.markW}
              height={lockup.ruleH}
              color={FOOTER_RULE_COLOR}
            />,
          );
          if (halalwebImage) {
            nodes.push(
              <SkImage
                key="halalweb"
                image={halalwebImage}
                x={centerX - lockup.halalW / 2}
                y={halalY}
                width={lockup.halalW}
                height={lockup.halalH}
                fit="contain"
              />,
            );
          }
          const textParaH = elements.watermarkParagraph.getHeight();
          nodes.push(
            <Paragraph
              key="watermark"
              paragraph={elements.watermarkParagraph}
              x={padding}
              y={y + elements.watermarkHeight - textParaH}
              width={contentWidth}
            />,
          );
        }

        return nodes;
      })()}
    </Canvas>
  );
};

export default React.memo(ShareCardPreview);
