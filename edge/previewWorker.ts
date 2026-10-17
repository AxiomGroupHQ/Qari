/**
 * Adds link-preview tags to shared playlist pages (/p/:id).
 * Every other path is served straight from the static assets.
 */
// Cloudflare Workers provide HTMLRewriter at runtime; this app's tsconfig has
// no workers types, so declare just the part used here.
interface RewriterElement {
  remove(): void;
  append(content: string, options?: {html?: boolean}): void;
}
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: {element: (el: RewriterElement) => void},
  ): HTMLRewriter;
  transform(res: Response): Response;
}

interface Env {
  ASSETS: {fetch: (req: Request) => Promise<Response>};
}

/**
 * The SPA shell HTML must never be cached: the bundle it references is
 * content-hashed, so a fresh shell always points at the latest deploy.
 * Without this, edge/browser caches can pin a user (suspended tabs,
 * bfcache, heuristic caching) to an old shell for days.
 */
function noStoreHtml(res: Response): Response {
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html')) return res;
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store');
  return out;
}

const API = 'https://iapi.istima.app/v1/share/playlist/';
const IMAGE = 'https://istima.app/icon.png';

function esc(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/p\/([A-Za-z0-9_-]{4,64})\/?$/);
    const shell = await env.ASSETS.fetch(
      new Request(new URL('/', url).toString(), request),
    );
    if (!match || request.method !== 'GET') return noStoreHtml(shell);

    let name = 'Playlist';
    let count = 0;
    try {
      const res = await fetch(API + match[1]);
      if (!res.ok) return shell;
      const data = (await res.json()) as {name?: string; items?: unknown[]};
      name = data.name || name;
      count = Array.isArray(data.items) ? data.items.length : 0;
    } catch {
      return shell;
    }

    const title = esc(`${name} on Istima`);
    const desc = esc(`A playlist of ${count} recitations. Open it in Istima.`);
    const tags = [
      `<title>${title}</title>`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:image" content="${IMAGE}">`,
      `<meta property="og:url" content="${esc(url.toString())}">`,
      `<meta property="og:type" content="music.playlist">`,
      `<meta name="twitter:card" content="summary">`,
    ].join('');

    return new HTMLRewriter()
      .on('title', {element: el => el.remove()})
      .on('head', {element: el => el.append(tags, {html: true})})
      .transform(noStoreHtml(shell));
  },
};
