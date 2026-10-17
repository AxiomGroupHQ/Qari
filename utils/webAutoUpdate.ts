/**
 * Native no-op. The web build uses utils/webAutoUpdate.web.ts.
 */
export function installWebAutoUpdate(): () => void {
  return () => {};
}
