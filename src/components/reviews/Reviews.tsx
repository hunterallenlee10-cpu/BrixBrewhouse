import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { REVIEWS, REVIEW_SUMMARY } from "@/lib/data";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { Stars } from "./Stars";

/**
 * What guests say: the rating summary, then a carousel of reviews from
 * /data/reviews.json. Reviews without text are skipped, and with none to show
 * the summary stands on its own.
 */
export function Reviews() {
  const s = REVIEW_SUMMARY;
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section bg-ink-0">
      <div className="wrap">
        <p className="t-mono text-[0.72rem] text-gold">Guest reviews</p>
        <h2 id="reviews-title" className="t-display mt-5 max-w-[14ch] text-[clamp(3rem,7vw,6rem)] text-foam">
          What the neighbors are saying
        </h2>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="flex items-center gap-4">
            <span aria-hidden className="t-display text-[3.25rem] leading-none text-foam">
              {s.rating}
            </span>
            <Stars rating={s.rating} size={24} />
          </p>
          <p className="text-lg text-text-2">
            {s.count} {s.source} reviews
          </p>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="t-mono inline-flex min-h-11 items-center gap-2 text-[0.72rem] text-gold-hi underline underline-offset-4 transition-colors hover:text-foam"
          >
            Read all reviews on {s.source}
            <ArrowUpRight aria-hidden size={14} weight="bold" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        {REVIEWS.length ? <ReviewsCarousel reviews={REVIEWS} source={s.source} /> : null}
      </div>
    </section>
  );
}
