// @ai-generated
import branding from '@/config/branding';

/** Converts A-Z / a-z to Unicode mathematical bold sans-serif so the footer
 *  stays bold in plain-text chats like WhatsApp. */
function toBold(text: string): string {
  return Array.from(text)
    .map(ch => {
      const c = ch.codePointAt(0) ?? 0;
      if (c >= 65 && c <= 90) return String.fromCodePoint(0x1d5d4 + c - 65);
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d5ee + c - 97);
      return ch;
    })
    .join('');
}

export const SHARE_FOOTER = [
  `🌙 ${toBold('Listen. Reflect. Remember Allah.')}`,
  '',
  toBold(`Visit and listen on ${branding.appName}.`),
  branding.shareBaseUrl,
  '',
  `${branding.appName.toLowerCase()} | Halalweb`,
].join('\n');

export function withShareFooter(text: string): string {
  return `${text.trimEnd()}\n\n${SHARE_FOOTER}`;
}
