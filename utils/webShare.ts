// @ai-generated
import {Platform, Share} from 'react-native';
import * as Sharing from 'expo-sharing';

const isWeb = Platform.OS === 'web';

function isAbort(error: unknown): boolean {
  return (error as {name?: string})?.name === 'AbortError';
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Shares text (and optionally a link); copies to the clipboard on browsers without the Web Share API. */
export async function shareMessage(message: string, url?: string) {
  if (!isWeb) {
    await Share.share(url ? {message: `${message}\n${url}`} : {message});
    return;
  }
  const full = url ? `${message}\n${url}` : message;
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share(url ? {text: message, url} : {text: message});
      return;
    }
  } catch (error) {
    if (isAbort(error)) return;
  }
  if (await copyToClipboard(full)) {
    window.alert('Copied to clipboard');
  } else {
    window.prompt('Copy this text', full);
  }
}

/** Shares a PNG. On web `uri` is a data URL; falls back to a download. */
export async function shareImageFile(uri: string) {
  if (!isWeb) {
    await Sharing.shareAsync(uri, {mimeType: 'image/png', UTI: 'public.png'});
    return;
  }
  const blob = await (await fetch(uri)).blob();
  const file = new File([blob], 'istima-verse.png', {type: 'image/png'});
  try {
    if (navigator.canShare?.({files: [file]})) {
      await navigator.share({files: [file]});
      return;
    }
  } catch (error) {
    if (isAbort(error)) return;
  }
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
