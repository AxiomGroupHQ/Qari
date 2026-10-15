// @ai-generated
// Geometry of the ISTIMA footer on the share card: wordmark, gold rule,
// then the Halalweb mark, mirroring the Ayah a Day card.
export const FOOTER_RULE_COLOR = '#9a7b3c';
export const WORDMARK_ASPECT = 900 / 258;
export const HALALWEB_ASPECT = 400 / 69;

export function footerLockup(contentWidth: number) {
  const markW = contentWidth * 0.13;
  const markH = markW / WORDMARK_ASPECT;
  const ruleH = Math.max(1.5, contentWidth * 0.004);
  const gapTop = contentWidth * 0.006;
  const gapBottom = contentWidth * 0.012;
  const halalW = markW * 0.78;
  const halalH = halalW / HALALWEB_ASPECT;
  return {
    markW,
    markH,
    ruleH,
    gapTop,
    gapBottom,
    halalW,
    halalH,
    height: markH + gapTop + ruleH + gapBottom + halalH,
  };
}
