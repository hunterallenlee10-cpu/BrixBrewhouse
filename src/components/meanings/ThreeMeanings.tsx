import type { ReactNode } from "react";
import { BayLabel, PhotoSlot } from "@/components/ui/primitives";

/** Each meaning gets a thin strip of its own material across the top: gold for the sugar, brick for the brick, red enamel for the firehouse. */
const MEANINGS: { n: string; title: ReactNode; strip: string; body: ReactNode }[] = [
  {
    n: "01",
    title: (
      <>
        Brix <span className="normal-case">(°Bx)</span>
      </>
    ),
    strip: "bg-[linear-gradient(90deg,#f0bf45,#d69e14_60%,#a8740a)]",
    body: <>Degrees Brix is how a brewer measures the sugar in the wort, before yeast turns it into beer. It&rsquo;s where flavor starts.</>,
  },
  {
    n: "02",
    title: "Brick",
    strip: "bg-brick bg-[url(/tex/brick.webp)] bg-[length:163px_auto] bg-[position:0_-1px]", // one course of brick, 12px tall
    body: <>Saylorsburg, home to both owners, was the biggest supplier of brick in the country in 1894.</>,
  },
  {
    n: "03",
    title: "The Firehouse",
    strip: "bg-red",
    body: <>The old West End Firehouse on Route 715 is brick inside and out. Most of the walls you&rsquo;ll drink beside are red brick.</>,
  },
];

/** BAY 01: one name, three meanings, side by side. */
export function ThreeMeanings() {
  return (
    <section id="brix" aria-labelledby="brix-title" className="section bg-black">
      <div className="wrap">
        <BayLabel n="01">Three meanings of Brix</BayLabel>
        <h2 id="brix-title" className="t-serif mt-4 max-w-[24ch] text-[clamp(1.6rem,3.4vw,2.8rem)] text-text-2">
          One name, three ways in. <span className="text-foam">Every brick of it is true.</span>
        </h2>

        <ol className="mt-12 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-8 lg:gap-12">
          {MEANINGS.map((m) => (
            <li key={m.n}>
              <span aria-hidden className={`block h-3 w-full ${m.strip}`} />
              <p className="t-mono mt-5 text-[0.72rem] text-gold-hi">{m.n}</p>
              <h3 className="t-display mt-2 text-[2.75rem] text-foam md:text-[clamp(2.2rem,4.2vw,3.75rem)]">{m.title}</h3>
              <p className="mt-4 max-w-[40ch] text-[1.05rem] leading-relaxed text-text-2">{m.body}</p>
            </li>
          ))}
        </ol>

        {/* the founders line */}
        <div className="mt-[clamp(5rem,10vw,8rem)] grid items-end gap-12 md:grid-cols-[1.35fr_0.65fr] md:gap-16">
          <blockquote className="t-serif pb-1 text-[clamp(2rem,4.6vw,4.1rem)] leading-[1.12] text-foam">
            Joe Elias and Chris Pohorenco met picking their kids up from school. Both had made beer and wine.{" "}
            <span className="text-gold-hi">Brix is what happened next.</span>
          </blockquote>
          <PhotoSlot label="Joe & Chris" ratio="4 / 5" tilt={1.5} className="mx-auto w-[min(100%,320px)]" />
        </div>
      </div>
    </section>
  );
}
