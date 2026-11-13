"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { REVIEWS } from "@/lib/data";

const EVERY_MS = 6500;

/**
 * Guest reviews on a carousel, from /data/reviews.json. It turns on its own
 * while on screen, and holds still when hovered, focused, touched, or when the
 * visitor prefers reduced motion. With too few reviews to scroll, it is just a row.
 */
export function Reviews() {
  const track = useRef<HTMLUListElement>(null);
  const hold = useRef(false);
  const [scrolls, setScrolls] = useState(false);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>("li");
    if (!el || !card) return;
    const by = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const end = el.scrollWidth - el.clientWidth;
    // past the last card, come back round to the first (and the reverse)
    const left = dir === 1 && el.scrollLeft >= end - 4 ? 0 : dir === -1 && el.scrollLeft <= 4 ? end : el.scrollLeft + dir * by;
    el.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let onScreen = false;
    const measure = new ResizeObserver(() => setScrolls(el.scrollWidth > el.clientWidth + 4));
    measure.observe(el);
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = reduce
      ? 0
      : window.setInterval(() => {
          if (onScreen && !hold.current && el.scrollWidth > el.clientWidth + 4) step(1);
        }, EVERY_MS);
    return () => {
      measure.disconnect();
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return (
    <section
      aria-label="Guest reviews"
      aria-roledescription="carousel"
      onPointerEnter={() => (hold.current = true)}
      onPointerLeave={() => (hold.current = false)}
      onFocus={() => (hold.current = true)}
      onBlur={() => (hold.current = false)}
    >
      <div className="flex items-end justify-between gap-4">
        <h3 className="t-display text-[clamp(2.2rem,4.4vw,3.6rem)] text-foam">What guests say</h3>
        {scrolls ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Previous review" className="visit-reviewNav">
              <CaretLeft aria-hidden size={18} weight="bold" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next review" className="visit-reviewNav">
              <CaretRight aria-hidden size={18} weight="bold" />
            </button>
          </div>
        ) : null}
      </div>

      <ul ref={track} className="visit-reviews mt-6" data-few={REVIEWS.reviews.length < 3 || undefined} tabIndex={scrolls ? 0 : undefined}>
        {REVIEWS.reviews.map((r) => (
          <li key={`${r.name}-${r.source}`} className="visit-reviewSlide">
            <figure className="visit-review flex h-full flex-col p-6 md:p-8">
              {r.photo ? (
                <img src={r.photo} alt={`Photo from ${r.name}'s review`} loading="lazy" decoding="async" className="mb-5 aspect-[16/10] w-full object-cover" />
              ) : null}
              <p className="t-mono flex items-center gap-3 text-[0.6875rem] text-gold">
                Guest review
                {r.stars ? (
                  <span role="img" aria-label={`${r.stars} out of 5 stars`} className="flex gap-0.5 text-gold-hi">
                    {Array.from({ length: r.stars }, (_, i) => (
                      <Star key={i} aria-hidden size={13} weight="fill" />
                    ))}
                  </span>
                ) : null}
              </p>
              <blockquote className="t-serif mt-4 text-[clamp(1.4rem,2.4vw,1.9rem)] text-foam">&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption className="t-mono mt-auto pt-5 text-[0.6875rem] text-text-2">
                {r.name} · {r.source}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
