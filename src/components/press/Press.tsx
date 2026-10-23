import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { BayLabel } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";
import { LiteYouTube } from "./LiteYouTube";

type Clip = (typeof SITE.press)[number];

/** One framed clipping. Paraphrased summary only; the story lives on the outlet's site. */
function Clipping({ clip, tilt, size }: { clip: Clip; tilt: number; size: "lg" | "md" }) {
  const big = size === "lg";
  return (
    <article className="press-frame" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className={`press-paper px-[clamp(1.1rem,2.6vw,2.4rem)] pb-[clamp(2rem,3.6vw,3.2rem)] pt-[clamp(1.1rem,2.2vw,2rem)]`}>
        <header className="flex items-end justify-between gap-4">
          <p
            className={`font-display font-extrabold uppercase leading-[0.86] tracking-[-0.01em] ${
              big ? "text-[clamp(3.6rem,8.6vw,8.2rem)]" : "text-[clamp(3rem,6.4vw,6rem)]"
            }`}
          >
            {clip.outlet}
          </p>
          <time dateTime={clip.iso} className="t-mono shrink-0 pb-1 text-right text-[0.6875rem] text-[#3b342a]">
            {clip.date}
          </time>
        </header>
        <div className={`press-rule mt-3`} />
        <h3 className={`press-headline mt-5 ${big ? "text-[clamp(1.7rem,3.3vw,3rem)]" : "text-[clamp(1.5rem,2.5vw,2.25rem)]"}`}>
          {clip.headline}
        </h3>
        <p className="t-mono mt-4 text-[0.6875rem] text-[#3b342a]">Reported by {clip.byline}</p>
        <p className="mt-4 max-w-[46ch] font-serif text-[1.08rem] italic leading-snug text-[#2a241c] md:text-[1.18rem]">{clip.summary}</p>
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`press-link mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-[#16130f] font-display text-[1.25rem] font-extrabold uppercase`}
        >
          Read the story
          <ArrowUpRight aria-hidden weight="bold" className={`press-arrow h-5 w-5`} />
          <span className="sr-only"> on {clip.outlet} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}

export function Press() {
  const [wnep, times] = SITE.press;
  return (
    <section id="press" aria-labelledby="press-title" className="section overflow-hidden bg-black">
      <div className="wrap">
        <BayLabel n="07">Press</BayLabel>
        <h2 id="press-title" className="press-title t-display mt-5 whitespace-nowrap leading-[0.8] text-foam">
          They said it.
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <Clipping clip={times} tilt={-1.4} size="lg" />
          </div>
          <div className="md:col-span-5 md:mt-40">
            <Clipping clip={wnep} tilt={1.8} size="md" />
          </div>
        </div>

        <div className="mt-20 grid items-end gap-8 md:mt-28 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="t-serif text-[clamp(1.9rem,3.6vw,3rem)] text-foam">See it for yourself.</p>
            <p className="mt-4 max-w-[34ch] text-text-2">A walk through the firehouse, from the Brix Brewhouse YouTube channel.</p>
          </div>
          <div className="md:col-span-8">
            <LiteYouTube id={SITE.youtubeId} title="Brix Brewhouse on YouTube" />
          </div>
        </div>
      </div>
    </section>
  );
}
