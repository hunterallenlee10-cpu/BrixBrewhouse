/**
 * Fire an analytics event if an analytics script is on the page (Vercel Web Analytics or Google tag).
 * Without one it does nothing, so a click never breaks.
 */
type W = Window & { va?: (kind: "event", data: { name: string; data?: Record<string, string> }) => void; gtag?: (...a: unknown[]) => void };

export function track(name: string, data?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const w = window as W;
  try {
    w.va?.("event", { name, data });
    w.gtag?.("event", name, data ?? {});
  } catch {
    /* analytics must never block the link */
  }
}
