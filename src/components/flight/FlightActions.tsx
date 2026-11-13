"use client";

import { useState } from "react";
import { LinkSimple } from "@phosphor-icons/react";
import { TapHandleButton } from "@/components/ui/TapHandleButton";

export function shareUrl(ids: string[]) {
  return `${window.location.origin}${window.location.pathname}#flight=${ids.join(",")}`;
}

/** Beside the paddle: come pour this flight for real, or send it to a friend. Sharing waits for a full paddle. */
export function FlightActions({ ids, size }: { ids: string[]; size: number }) {
  const [copied, setCopied] = useState<{ state: "ok" | "manual"; url: string } | null>(null);
  const full = ids.length === size;
  const url = full ? shareUrl(ids) : "";
  // the note only stands while the flight it was copied for is still on the paddle
  const note = copied && copied.url === url ? copied : null;

  const share = async () => {
    if (!full) return;
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied({ state: "ok", url });
    } catch {
      setCopied({ state: "manual", url });
    }
  };

  return (
    <div className="mt-8 flex flex-col items-start gap-3 border-t border-line pt-6">
      <TapHandleButton label="Pour this flight" />
      <button
        type="button"
        onClick={share}
        aria-disabled={!full || undefined}
        data-cursor="cap"
        className={`t-mono inline-flex h-14 items-center gap-2 border px-5 text-[0.7rem] transition-colors ${
          full ? "border-line-strong text-foam hover:border-gold-hi hover:text-gold-hi" : "cursor-not-allowed border-line text-text-3"
        }`}
      >
        <LinkSimple size={18} aria-hidden /> Share my flight
      </button>
      <p role="status" aria-live="polite" className={`t-mono text-[0.6875rem] ${note ? "text-gold-hi" : "text-text-2"}`}>
        {note?.state === "ok"
          ? "Link copied. Send it to whoever's driving."
          : note?.state === "manual"
            ? "Copy this link:"
            : full
              ? "Four glasses poured. Ready to share."
              : `Pour ${size - ids.length} more to share it.`}
      </p>
      {note?.state === "manual" ? (
        <input readOnly value={note.url} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" className="h-11 w-full border border-line-strong bg-ink-1 px-3 font-mono text-sm text-foam" />
      ) : null}
    </div>
  );
}
