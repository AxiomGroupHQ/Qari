import React from 'react';
import {ViewStyle} from 'react-native';
import {Surah} from '@/data/surahData';
import {SurahHeroSection} from '@/components/hero/SurahsHero';
import {t} from '@/i18n';

interface SurahOfTheDayProps {
  surah: Surah;
  onLongPress?: (surah: Surah) => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * A component that displays the Surah of the Day card
 * with zoom transition to mushaf.
 */
export function SurahOfTheDay({surah, onLongPress, style}: SurahOfTheDayProps) {
  return (
    <SurahHeroSection
      surah={surah}
      onLongPress={onLongPress}
      title={t('hero.surahOfTheDay.surahOfTheDay')}
      isCompact={true}
      style={style}
    />
  );
}
