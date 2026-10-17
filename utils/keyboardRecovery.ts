/**
 * Native no-op. The web build uses utils/keyboardRecovery.web.ts.
 */
export function installKeyboardRecovery(): () => void {
  return () => {};
}
