import i18next from 'i18next';
import {getLocaleInfo} from '@/i18n/locales';

/** Best BCP 47 tag the runtime's Intl has data for, for the active locale. */
export function getIntlTag(code: string = i18next.language): string {
  const info = getLocaleInfo(code);
  const candidates = [info.intlTag, ...(info.intlFallbacks ?? []), 'en'];
  for (const c of candidates) {
    try {
      if (Intl.NumberFormat.supportedLocalesOf([c]).length > 0) return c;
    } catch {
      /* try next */
    }
  }
  return 'en';
}

export const formatNumber = (
  n: number,
  opts?: Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(getIntlTag(), opts).format(n);

export const formatPercent = (fraction: number): string =>
  formatNumber(fraction, {style: 'percent', maximumFractionDigits: 0});

export const formatBytes = (bytes: number): string => {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  try {
    return new Intl.NumberFormat(getIntlTag(), {
      style: 'unit',
      unit: units[i],
      unitDisplay: 'narrow',
      maximumFractionDigits: i === 0 ? 0 : 1,
    }).format(v);
  } catch {
    return `${v.toFixed(i === 0 ? 0 : 1)} ${['B', 'KB', 'MB', 'GB'][i]}`;
  }
};

export const formatDate = (
  d: Date | number,
  opts: Intl.DateTimeFormatOptions = {dateStyle: 'medium'},
): string => new Intl.DateTimeFormat(getIntlTag(), opts).format(d);

/** Hijri (Umm al-Qura) date; falls back to Gregorian if unsupported. */
export const formatHijriDate = (d: Date | number): string => {
  try {
    return new Intl.DateTimeFormat(`${getIntlTag()}-u-ca-islamic-umalqura`, {
      dateStyle: 'medium',
    }).format(d);
  } catch {
    return formatDate(d);
  }
};

/** Duration in seconds as m:ss or h:mm:ss using locale digits. */
export const formatDuration = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const two = (n: number) =>
    formatNumber(n, {minimumIntegerDigits: 2, useGrouping: false});
  return h > 0
    ? `${formatNumber(h, {useGrouping: false})}:${two(m)}:${two(sec)}`
    : `${formatNumber(m, {useGrouping: false})}:${two(sec)}`;
};

export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
): string => {
  try {
    return new Intl.RelativeTimeFormat(getIntlTag(), {numeric: 'auto'}).format(
      value,
      unit,
    );
  } catch {
    return `${value} ${unit}`;
  }
};

export const formatList = (items: string[]): string => {
  try {
    return new Intl.ListFormat(getIntlTag(), {
      style: 'long',
      type: 'conjunction',
    }).format(items);
  } catch {
    return items.join(', ');
  }
};
