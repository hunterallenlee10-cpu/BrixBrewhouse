/** Run fn in an idle slot (or after `timeout` ms). Returns a cancel function. */
export function whenIdle(fn: () => void, timeout = 600): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const t = window.setTimeout(fn, Math.min(timeout, 200));
  return () => window.clearTimeout(t);
}
