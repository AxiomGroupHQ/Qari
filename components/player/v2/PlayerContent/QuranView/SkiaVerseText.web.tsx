// @ai-generated
// Web: one WebGL canvas per verse exhausts the browser's context limit and
// leaves some verses blank, so render the Arabic with plain text instead.
import React, {useMemo} from 'react';
import {Text} from 'react-native';
import {getTextAllahNameCharMap} from '@/services/mushaf/AllahNameHighlightService';
import {getVerseTajweedMap} from '@/services/mushaf/DigitalKhattVerseTajweedService';
import {tajweedColors} from '@/constants/tajweedColors';
import type {IndexedTajweedData} from '@/utils/tajweedLoader';
import type {
  MushafArabicTextWeight,
  RewayahId,
} from '@/store/mushafSettingsStore';
import {useMushafSettingsStore} from '@/store/mushafSettingsStore';
import {useRewayahWords} from '@/hooks/useRewayahWords';

interface SkiaVerseTextProps {
  verseKey?: string;
  text?: string;
  fontMgr?: unknown;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  showTajweed: boolean;
  width: number;
  indexedTajweedData: IndexedTajweedData | null;
  arabicTextWeight?: MushafArabicTextWeight;
  showAllahNameHighlight?: boolean;
  allahNameHighlightColor?: string;
  rewayah?: RewayahId;
}

const SkiaVerseText: React.FC<SkiaVerseTextProps> = ({
  verseKey,
  text,
  fontFamily,
  fontSize,
  textColor,
  showTajweed,
  width,
  indexedTajweedData,
  arabicTextWeight = 'normal',
  showAllahNameHighlight = false,
  allahNameHighlightColor,
  rewayah,
}) => {
  const mushafRewayah = useMushafSettingsStore(s => s.rewayah);
  const effectiveRewayah = (rewayah ?? mushafRewayah) as Parameters<
    typeof useRewayahWords
  >[1];
  const {words, status} = useRewayahWords(
    text !== undefined ? null : verseKey ?? null,
    effectiveRewayah,
  );
  const verseText =
    text ?? (status === 'ready' ? words.map(w => w.text).join(' ') : '');

  const segments = useMemo(() => {
    const tajweedMap =
      verseKey && showTajweed && indexedTajweedData
        ? getVerseTajweedMap(verseKey, indexedTajweedData)
        : null;
    const allahMap =
      showAllahNameHighlight && allahNameHighlightColor && verseText
        ? getTextAllahNameCharMap(verseText)
        : null;
    const out: Array<{text: string; color: string | null}> = [];
    for (let i = 0; i < verseText.length; i++) {
      const rule = tajweedMap?.get(i);
      const color = allahMap?.has(i)
        ? allahNameHighlightColor ?? null
        : rule && tajweedColors[rule]
        ? tajweedColors[rule]
        : null;
      const last = out[out.length - 1];
      if (last && last.color === color) {
        last.text += verseText.charAt(i);
      } else {
        out.push({text: verseText.charAt(i), color});
      }
    }
    return out;
  }, [
    verseKey,
    verseText,
    showTajweed,
    indexedTajweedData,
    showAllahNameHighlight,
    allahNameHighlightColor,
  ]);

  if (!verseText || width <= 0) return null;

  return (
    <Text
      style={{
        width,
        color: textColor,
        fontFamily,
        fontSize,
        lineHeight: fontSize * 1.9,
        textAlign: 'right',
        writingDirection: 'rtl',
        fontWeight: arabicTextWeight === 'normal' ? 'normal' : '600',
      }}>
      {segments.map((s, i) =>
        s.color ? (
          <Text key={i} style={{color: s.color}}>
            {s.text}
          </Text>
        ) : (
          s.text
        ),
      )}
    </Text>
  );
};

export default React.memo(SkiaVerseText);
