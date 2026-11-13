"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Review } from "@/lib/data";
import { Stars } from "./Stars";

const EVERY_MS = 6000;
/** the most cards ever in view at once; an endless loop needs more reviews than that */
const MAX_PER_VIEW = 3;
/** how long the track must sit still before it is quietly moved back to the middle copy */
const SETTLE_MS = 140;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const noop = () => () => {};

/**
 * Where the track is, in whole cards. Read from the DOM, so it is right at any width.
 * `sets` is how many copies of the reviews are in the track: 3 when it loops, 1 when it does not.
 */
function geometry(el: HTMLUListElement, count: number, sets: number) {
  const first = el.firstElementChild as HTMLElement | null;
  if (!first || !first.offsetWidth) return null;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  const step = first.offsetWidth + gap;
  const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
  const end = el.scrollWidth - el.clientWidth;
  const slot = Math.round(el.scrollLeft / step); // which card, of every copy, is first in view
  if (sets > 1) return { step, perView, end, slot, positions: count, index: ((slot % count) + count) % count };
  const positions = Math.max(1, count - perView + 1);
  return { step, perView, end, slot, positions, index: el.scrollLeft >= end - 2 ? positions - 1 : Math.min(positions - 1, Math.max(0, slot)) };
}

/**
 * The reviews as a scroll-snap track: swipe and trackpad work natively, the
 * buttons and arrow keys step one card, and the dots follow the scroll.
 *
 * It is endless. The track holds three copies of the reviews and rests in the
 * middle one; whenever it comes to a stop in an outer copy it is moved, unseen,
 * to the same card in the middle. So the first review always follows the last,
 * in either direction, with no rewind. Only the middle copy is exposed to
 * assistive technology and the keyboard, and the copies are added in the
 * browser, so the server HTML carries each review once.
 *
 * It turns on its own every six seconds while on screen. Hover and focus hold
 * it; touching, clicking or keying through it stops it for good. With reduced
 * motion it never turns on its own and nothing animates.
 */
export function ReviewsCarousel({ reviews, source }: { reviews: Review[]; source: string }) {
  const count = reviews.length;
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const loop = hydrated && count > MAX_PER_VIEW;
  const sets = loop ? 3 : 1;

  const track = useRef<HTMLUListElement>(null);
  const hold = useRef({ hover: false, focus: false, stopped: false, onScreen: false, touching: false });
  const [view, setView] = useState({ index: 0, positions: count });
  const [manual, setManual] = useState(false); // the visitor has taken over
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const [clipped, setClipped] = useState<ReadonlySet<number>>(new Set());

  /** Looping only: if the track rests in an outer copy, move it to the same card in the middle copy. */
  const recentre = useCallback(() => {
    const el = track.current;
    const g = el && sets > 1 ? geometry(el, count, sets) : null;
    if (!el || !g) return;
    const width = count * g.step;
    if (g.slot < count) el.scrollLeft += width;
    else if (g.slot >= 2 * count) el.scrollLeft -= width;
  }, [count, sets]);

  const sync = useCallback(() => {
    const g = track.current && geometry(track.current, count, sets);
    if (g) setView((v) => (v.index === g.index && v.positions === g.positions ? v : { index: g.index, positions: g.positions }));
  }, [count, sets]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      if (!el) return;
      recentre(); // so there is always a card to move to on either side
      const g = geometry(el, count, sets);
      if (!g) return;
      const behavior = reducedMotion() ? "auto" : "smooth";
      if (sets > 1) return el.scrollTo({ left: (g.slot + dir) * g.step, behavior });
      // too few reviews to loop: past the last card, come back round to the first (and the reverse)
      const next = g.index + dir > g.positions - 1 ? 0 : g.index + dir < 0 ? g.positions - 1 : g.index + dir;
      el.scrollTo({ left: Math.min(next * g.step, g.end), behavior });
    },
    [count, sets, recentre],
  );

  const takeOver = useCallback(() => {
    hold.current.stopped = true;
    setManual(true);
  }, []);

  // follow the scroll, re-measure on resize, and find which reviews run past six lines
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const state = hold.current;
    let frame = 0;
    let settle = 0;
    const settled = () => {
      // never move the track under a finger; the lift will bring us back here
      if (state.touching) return;
      recentre();
      sync();
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
      window.clearTimeout(settle);
      settle = window.setTimeout(settled, SETTLE_MS);
    };
    const onTouchStart = () => (state.touching = true);
    const onTouchEnd = () => {
      state.touching = false;
      window.clearTimeout(settle);
      settle = window.setTimeout(settled, SETTLE_MS);
    };
    const measure = () => {
      recentre(); // also places the track in the middle copy the first time it has a size
      sync();
      const over = new Set<number>();
      el.querySelectorAll<HTMLElement>("[data-review-text]").forEach((p) => {
        // an open review has nothing hidden to measure: keep its toggle
        if (p.dataset.open === "true" || p.scrollHeight > p.clientHeight + 1) over.add(Number(p.dataset.reviewText));
      });
      setClipped((prev) => (prev.size === over.size && [...over].every((i) => prev.has(i)) ? prev : over));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => undefined);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [sync, recentre]);

  // autoplay, and the one-time rise as the section comes into view
  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    const state = hold.current;
    // hide the cards only if the section starts below the fold, so the rise is seen.
    // The section is asked, not the track: rooms far off screen are not laid out yet
    // (content-visibility), so the track has no position of its own to report.
    const arm = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) el.classList.add("rv-armed");
      arm.disconnect();
    });
    arm.observe(el.closest("section") ?? el);
    const io = new IntersectionObserver(
      ([e]) => {
        state.onScreen = e.isIntersecting;
        if (e.isIntersecting) el.classList.add("rv-in");
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    const id = window.setInterval(() => {
      if (state.onScreen && !state.hover && !state.focus && !state.stopped && !state.touching && !document.hidden) go(1);
    }, EVERY_MS);
    return () => {
      arm.disconnect();
      io.disconnect();
      window.clearInterval(id);
    };
  }, [go]);

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // the middle copy is the real list; the copies either side only keep the loop seamless
  const copies = loop ? (["before", "real", "after"] as const) : (["real"] as const);

  return (
    <div
      className="mt-12 md:mt-14"
      onPointerEnter={(e) => e.pointerType === "mouse" && (hold.current.hover = true)}
      onPointerLeave={() => (hold.current.hover = false)}
      onPointerDown={(e) => e.pointerType !== "mouse" && takeOver()}
      onFocus={() => (hold.current.focus = true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && (hold.current.focus = false)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        takeOver();
        go(e.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <ul ref={track} role="list" tabIndex={0} aria-label="Guest reviews. Use the left and right arrow keys to move through them." className="rv-track">
        {copies.map((copy) =>
          reviews.map((r, i) => (
            <Card key={`${copy}-${i}`} review={r} index={i} source={source} copy={copy !== "real"} open={expanded.has(i)} clipped={clipped.has(i)} onToggle={() => toggle(i)} />
          )),
        )}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div aria-hidden className="flex min-h-11 flex-wrap items-center gap-2">
          {Array.from({ length: view.positions }, (_, i) => (
            <span key={i} className={`rv-dot ${i === view.index ? "rv-dotOn" : ""}`} />
          ))}
        </div>
        <p aria-live={manual ? "polite" : "off"} className="sr-only">
          Review {view.index + 1} of {count} is first in view
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous review"
            data-cursor="cap"
            className="rv-nav"
            onClick={() => {
              takeOver();
              go(-1);
            }}
          >
            <CaretLeft aria-hidden size={20} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            data-cursor="cap"
            className="rv-nav"
            onClick={() => {
              takeOver();
              go(1);
            }}
          >
            <CaretRight aria-hidden size={20} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * One review. A `copy` is a stand-in that keeps the loop seamless: it looks and
 * clicks the same, but is hidden from assistive technology and skipped by the
 * Tab key, so each review is announced and reached once.
 */
function Card({
  review: r,
  index: i,
  source,
  copy,
  open,
  clipped,
  onToggle,
}: {
  review: Review;
  index: number;
  source: string;
  copy: boolean;
  open: boolean;
  clipped: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="rv-slide" aria-hidden={copy || undefined} style={{ "--i": i } as React.CSSProperties}>
      <figure className="rv-card">
        {r.photo ? <img src={r.photo} alt={copy ? "" : `Photo from ${r.name}’s review`} loading="lazy" decoding="async" className="rv-photo" /> : null}
        <Stars rating={r.stars} />
        <blockquote className="mt-5">
          {/* only the real card is measured for the six-line clamp, and only it carries the id the toggle points at */}
          <p id={copy ? undefined : `review-${i}`} data-review-text={copy ? undefined : i} data-open={open} className="rv-text">
            {r.text}
          </p>
        </blockquote>
        <button
          type="button"
          onClick={onToggle}
          tabIndex={copy ? -1 : undefined}
          aria-expanded={open}
          aria-controls={copy ? undefined : `review-${i}`}
          className={`rv-more t-mono ${clipped ? "" : "invisible"}`}
        >
          {open ? "Show less" : "Read more"}
          <span className="sr-only"> of {r.name}&rsquo;s review</span>
        </button>
        <figcaption className="rv-by">
          <span aria-hidden className="rv-avatar">
            {r.name.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foam">{r.name}</span>
            <span className="t-mono block text-[0.6875rem] text-text-2">
              {r.localGuide ? "Local Guide · " : ""}
              {r.when}
            </span>
            <span className="t-mono mt-1 block text-[0.6875rem] text-text-3">Posted on {source}</span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}
