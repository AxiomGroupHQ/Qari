/**
 * Dependency-free gate shared by the clip service and the recitation player. While an intro/outro
 * clip is running, the recitation player waits here before it plays, so the two can never overlap.
 */
let active: Promise<unknown> | null = null;

export function setActiveClip(job: Promise<unknown> | null): void {
  active = job;
}
export function getActiveClip(): Promise<unknown> | null {
  return active;
}
export async function whenClipIdle(): Promise<void> {
  while (active) {
    await active.catch(() => undefined);
  }
}
