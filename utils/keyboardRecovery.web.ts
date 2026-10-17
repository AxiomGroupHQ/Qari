/**
 * MITIGATION (not a cure) for iOS WebKit keyboard/viewport bugs
 * (WebKit 279904 and the iOS 26 visualViewport regressions): Safari and
 * other iOS browsers (all WebKit) can fail to scroll a focused input
 * into view when the software keyboard opens, and can leave the layout
 * viewport scrolled/offset after the keyboard closes, so the page looks
 * squashed or clipped until a reload. The root cause is at the OS/WebKit
 * layer - this handler only repairs the two visible symptoms:
 *
 *  1. Keyboard opened -> scroll the focused input back into view.
 *  2. Keyboard closed -> reset the document scroll offset so the page
 *     is no longer stuck shifted/clipped.
 *
 * It cannot fix the "keyboard never appears" variant; that still needs
 * a page reload or browser restart.
 *
 * Detection heuristic: iOS shrinks `visualViewport.height` while the
 * keyboard is open but keeps `window.innerHeight` (the layout viewport)
 * unchanged. Desktop browsers keep both in sync, so the 80% ratio gate
 * never triggers there. The app scrolls inside its own containers, so
 * resetting the window scroll position cannot disrupt in-app scroll.
 *
 * Must be verified on a real iPhone before being trusted.
 */
export function installKeyboardRecovery(): () => void {
  if (typeof window === 'undefined' || !window.visualViewport) {
    return () => {};
  }

  const viewport = window.visualViewport;
  let keyboardOpen = false;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;

  const isTextInput = (el: Element | null): el is HTMLElement =>
    !!el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      (el as HTMLElement).isContentEditable);

  const handleResize = () => {
    const open = viewport.height < window.innerHeight * 0.8;

    if (open && !keyboardOpen) {
      keyboardOpen = true;
      const el = document.activeElement;
      if (isTextInput(el)) {
        // Let the keyboard animation settle before scrolling.
        scrollTimer = setTimeout(() => {
          el.scrollIntoView({block: 'center', behavior: 'smooth'});
        }, 250);
      }
    } else if (!open && keyboardOpen) {
      keyboardOpen = false;
      // Repair the stuck offset once the viewport has restored.
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  };

  // Cover the case where the keyboard opens without a resize event
  // (observed in some iOS betas): scroll the input into view on focus.
  const handleFocusIn = (event: FocusEvent) => {
    if (!keyboardOpen || !isTextInput(event.target as Element | null)) {
      return;
    }
    const el = event.target as HTMLElement;
    scrollTimer = setTimeout(() => {
      el.scrollIntoView({block: 'center', behavior: 'smooth'});
    }, 250);
  };

  viewport.addEventListener('resize', handleResize);
  document.addEventListener('focusin', handleFocusIn);

  return () => {
    viewport.removeEventListener('resize', handleResize);
    document.removeEventListener('focusin', handleFocusIn);
    if (scrollTimer) clearTimeout(scrollTimer);
  };
}
