/** Share-card canvas dimensions, colors, and typography sizes. */

export const CARD_WIDTH = 1080;
export const CARD_PADDING = 60;
export const CARD_CONTENT_WIDTH = CARD_WIDTH - CARD_PADDING * 2;

// Typography
export const CARD_VERSE_FONT_SIZE = 48;
export const CARD_WATERMARK_FONT_SIZE = 22;
export const CARD_WATERMARK_ICON_SIZE = 28;
export const CARD_WATERMARK_GAP = 8;
export const CARD_VERSE_LINE_HEIGHT = 1.8;

// Surah header sizing relative to content width
export const CARD_HEADER_NAME_RATIO = 0.4; // name font = divider font * ratio

// Vertical spacing
export const CARD_TOP_PADDING = 50;
export const CARD_HEADER_BOTTOM_GAP = 40;
export const CARD_VERSE_BOTTOM_GAP = 30;
export const CARD_BOTTOM_PADDING = 40;

// Cross-surah gap (space before a second surah header)
export const CARD_SURAH_GAP = 30;

// Basmallah sizing
export const CARD_BASMALLAH_FONT_RATIO = 0.85; // relative to verse font size
export const CARD_BASMALLAH_BOTTOM_GAP = 12;

export interface ShareCardColors {
  background: string;
  text: string;
  secondary: string;
  divider: string;
}

export const LIGHT_COLORS: ShareCardColors = {
  background: '#f4f3ec',
  text: '#06151C',
  secondary: '#052c39',
  divider: '#052c39',
};

export const DARK_COLORS: ShareCardColors = {
  background: '#050b10',
  text: '#e8e8e8',
  secondary: '#B0B0B0',
  divider: '#B0B0B0',
};

// ISTIMA listening-wave mark, shared by native and browser share cards. // @ai
export const STARBURST_PATH_DATA = // @ai
  'M220 340h70v192h-70z M350 230h70v412h-70z M480 70h70v732h-70z M610 230h70v412h-70z M740 340h70v192h-70z'; // @ai
