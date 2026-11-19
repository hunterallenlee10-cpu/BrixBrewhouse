"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { getStatus, statusText, type Status } from "@/lib/hours";

/**
 * Live open/closed pill computed in America/New_York from /data/hours.json.
 * With the owners' sheet connected it also says how many beers are pouring, and the server-rendered
 * text is that count, so the pill never shows a loading line.
 */
export function StatusPill({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "glass" }) {
  const { tapCount } = useSite();
  const [status, setStatus] = useState<Status | null>(null);
  const onTap = tapCount ? `${tapCount} beers on tap right now` : null;
  useEffect(() => {
    const tick = () => setStatus(getStatus(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  const t = status ? statusText(status) : null;
  const open = status?.state === "open";
  const bg = tone === "glass" ? "bg-black/55 backdrop-blur-md" : "bg-ink-2";
  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex min-h-9 items-center gap-2.5 border border-line-strong px-3.5 py-1.5 ${bg} ${className}`}
    >
      {open ? <span aria-hidden className="pulse-dot shrink-0" /> : <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-text-3" />}
      <span className="t-mono text-[0.7rem] leading-none text-foam">
        {t ? (
          <>
            <strong className={open ? "font-bold text-gold-hi" : "font-bold text-foam"}>{t.lead}</strong>
            <span className="text-text-2"> · {t.rest}</span>
            {open && tapCount ? <span className="text-text-2"> · {tapCount} on tap</span> : null}
          </>
        ) : (
          <span className="text-text-2">{onTap ?? "Checking the taps…"}</span>
        )}
      </span>
    </p>
  );
}
