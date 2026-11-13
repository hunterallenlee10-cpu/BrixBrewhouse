"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Review } from "@/lib/data";
import { Stars } from "./Stars";

const EVERY_MS = 6000;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Where the track is, in whole cards. Read from the DOM, so it is right at any width. */
function geometry(el: HTMLUListElement) {
  const first = el.firstElementChild as HTMLElement | null;
  if (!first) return null;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  const step = first.offsetWidth + gap;
  const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
  const positions = Math.max(1, el.children.length - perView + 1);
  const end = el.scrollWidth - el.clientWidth;
  const index = el.scrollLeft >= end - 2 ? positions - 1 : Math.min(positions - 1, Math.max(0, Math.round(el.scrollLeft / step)));
  return { step, perView, positions, end, index };
}

/**
 * The reviews as a scroll-snap track: swipe and trackpad work natively, the
 * buttons and arrow keys step one card, and the dots follow the scroll.
 * It turns on its own every six seconds while on screen. Hover and focus hold
 * it; touching, clicking or keying through it stops it for good. With reduced
 * motion it never turns on its own and nothing animates.
 */
export function ReviewsCarousel({ reviews, source }: { reviews: Review[]; source: string }) {
  const track = useRef<HTMLUListElement>(null);
  const hold = useRef({ hover: false, focus: false, stopped: false, onScreen: false });
  const [view, setView] = useState({ index: 0, perView: 1, positions: reviews.length });
  const [manual, setManual] = useState(false); // the visitor has taken over
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const [clipped, setClipped] = useState<ReadonlySet<number>>(new Set());

  const sync = useCallback(() => {
    const g = track.current && geometry(track.current);
    if (g) setView((v) => (v.index === g.index && v.perView === g.perView && v.positions === g.positions ? v : { index: g.index, perView: g.perView, positions: g.positions }));
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    const el = track.current;
    const g = el && geometry(el);
    if (!el || !g) return;
    // past the last card, come back round to the first (and the reverse)
    const next = g.index + dir > g.positions - 1 ? 0 : g.index + dir < 0 ? g.positions - 1 : g.index + dir;
    el.scrollTo({ left: Math.min(next * g.step, g.end), behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  const takeOver = useCallback(() => {
    hold.current.stopped = true;
    setManual(true);
  }, []);

  // follow the scroll, re-measure on resize, and find which reviews run past six lines
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    const measure = () => {
      sync();
      const over = new Set<number>();
      el.querySelectorAll<HTMLElement>("[data-review-text]").forEach((p, i) => {
        // an open review has nothing hidden to measure: keep its toggle
        if (p.dataset.open === "true" || p.scrollHeight > p.clientHeight + 1) over.add(i);
      });
      setClipped((prev) => (prev.size === over.size && [...over].every((i) => prev.has(i)) ? prev : over));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => undefined);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sync]);

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
      if (state.onScreen && !state.hover && !state.focus && !state.stopped && !document.hidden) go(1);
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

  const last = Math.min(view.index + view.perView, reviews.length);
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
        {reviews.map((r, i) => {
          const open = expanded.has(i);
          return (
            <li key={`${r.name}-${i}`} className="rv-slide" style={{ "--i": i } as React.CSSProperties}>
              <figure className="rv-card">
                {r.photo ? (
                  <img src={r.photo} alt={`Photo from ${r.name}’s review`} loading="lazy" decoding="async" className="rv-photo" />
                ) : null}
                <Stars rating={r.stars} />
                <blockquote className="mt-5">
                  <p id={`review-${i}`} data-review-text data-open={open} className="rv-text">
                    {r.text}
                  </p>
                </blockquote>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={open}
                  aria-controls={`review-${i}`}
                  className={`rv-more t-mono ${clipped.has(i) ? "" : "invisible"}`}
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
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div aria-hidden className="flex min-h-11 flex-wrap items-center gap-2">
          {Array.from({ length: view.positions }, (_, i) => (
            <span key={i} className={`rv-dot ${i === view.index ? "rv-dotOn" : ""}`} />
          ))}
        </div>
        <p aria-live={manual ? "polite" : "off"} className="sr-only">
          {last - view.index > 1 ? `Showing reviews ${view.index + 1} to ${last} of ${reviews.length}` : `Showing review ${view.index + 1} of ${reviews.length}`}
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
