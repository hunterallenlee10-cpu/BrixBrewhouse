import { Star, StarHalf } from "@phosphor-icons/react/dist/ssr";

/**
 * Five stars for a rating out of five, to the nearest half. The stars are
 * decoration; the rating is exposed as text ("Rated 4.5 out of 5").
 */
export function Stars({ rating, size = 18, className = "" }: { rating: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`Rated ${rating} out of 5`} className={`inline-flex gap-0.5 text-gold-hi ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const part = rating - i; // how much of this star is earned
        if (part >= 0.75) return <Star key={i} aria-hidden size={size} weight="fill" />;
        if (part < 0.25) return <Star key={i} aria-hidden size={size} weight="regular" className="opacity-45" />;
        return (
          // half: a filled left half laid over the outline of the whole star
          <span key={i} aria-hidden className="relative block" style={{ width: size, height: size }}>
            <Star size={size} weight="regular" className="absolute inset-0 opacity-45" />
            <StarHalf size={size} weight="fill" className="absolute inset-0" />
          </span>
        );
      })}
    </span>
  );
}
