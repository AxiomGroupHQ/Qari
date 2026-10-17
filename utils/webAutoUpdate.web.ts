/**
 * Web-only self-update. istima.app serves a content-hashed JS bundle
 * (qari-entry-<hash>.js) referenced from a small HTML shell, but a phone
 * browser can hold the old shell/bundle for days: suspended tabs, bfcache
 * restores, and heuristic HTTP caching all serve yesterday's page without
 * ever asking the server. The visible symptom is "the new version is live
 * but my phone still shows the old one".
 *
 * On startup and whenever the tab regains focus, re-fetch the current URL
 * bypassing caches and compare the served bundle filename with the running
 * one. On a mismatch, reload once. Guards:
 *  - at most one reload per target hash per session (a stale edge cache
 *    must not cause a reload loop);
 *  - checks throttled to one per 30s so focus flapping does not spam the
 *    network;
 *  - skipped entirely on localhost/dev.
 */
const RELOAD_KEY = 'istima.autoUpdateTarget';
const THROTTLE_MS = 30_000;
const ENTRY_RE = /\/_expo\/static\/js\/web\/qari-entry-[a-f0-9]+\.js/;

export function extractEntryBundle(html: string): string | null {
  const match = html.match(ENTRY_RE);
  return match ? match[0] : null;
}

function currentEntryBundle(): string | null {
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="/_expo/static/js/web/"]',
  );
  return script ? extractEntryBundle(script.src) : null;
}

export function installWebAutoUpdate(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return () => {};
  }

  let lastCheck = 0;
  let disposed = false;

  const check = async () => {
    if (disposed) return;
    const now = Date.now();
    if (now - lastCheck < THROTTLE_MS) return;
    lastCheck = now;

    const running = currentEntryBundle();
    if (!running) return;

    try {
      const res = await fetch(window.location.href, {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!res.ok) return;
      const served = extractEntryBundle(await res.text());
      if (!served || served === running) return;

      // Never reload twice for the same target: if a cache layer keeps
      // serving the old shell after our reload, accept it rather than loop.
      if (sessionStorage.getItem(RELOAD_KEY) === served) return;
      sessionStorage.setItem(RELOAD_KEY, served);
      window.location.reload();
    } catch {
      // Offline or blocked: stay silent, the next focus retries.
    }
  };

  const startTimer = setTimeout(check, 3000);
  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };
  const onPageShow = (event: PageTransitionEvent) => {
    // bfcache restore: the page is by definition as old as its tab.
    if (event.persisted) check();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('pageshow', onPageShow);

  return () => {
    disposed = true;
    clearTimeout(startTimer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('pageshow', onPageShow);
  };
}
