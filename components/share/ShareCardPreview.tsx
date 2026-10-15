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
  CARD_HEADER_BOTTOM_GAP,
  CARD_VERSE_BOTTOM_GAP,
  CARD_SURAH_GAP,
  CARD_BASMALLAH_BOTTOM_GAP,
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
  const totalHeight = elements.totalHeight + padding * 2;

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

      {/* Sections */}
      {(() => {
        let y = padding + CARD_TOP_PADDING * scale;
        const nodes: React.ReactNode[] = [];

        elements.sections.forEach((section, i) => {
          if (i > 0) y += CARD_SURAH_GAP * scale;

          // Divider (ornamental frame)
          nodes.push(
            <Paragraph
              key={`div-${i}`}
              paragraph={section.dividerParagraph}
              x={padding}
              y={y}
              width={contentWidth}
            />,
          );

          // QCF surah name (centered within divider, recolored)
          const nameY = y + (section.dividerHeight - section.nameHeight) / 2;
          nodes.push(
            <Group key={`name-${i}`} layer={nameColorPaint}>
              <Paragraph
                paragraph={section.nameParagraph}
                x={padding}
                y={nameY}
                width={contentWidth}
              />
            </Group>,
          );

          y += section.dividerHeight + CARD_HEADER_BOTTOM_GAP * scale;

          // Basmallah (between divider and verse text)
          if (section.basmallahParagraph) {
            nodes.push(
              <Paragraph
                key={`basm-${i}`}
                paragraph={section.basmallahParagraph}
                x={padding}
                y={y}
                width={contentWidth}
              />,
            );
            y += section.basmallahHeight + CARD_BASMALLAH_BOTTOM_GAP * scale;
          }

          // Verse text
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
