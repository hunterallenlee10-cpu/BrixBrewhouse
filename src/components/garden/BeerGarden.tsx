import { BayLabel, PhotoSlot } from "@/components/ui/primitives";

const OUT_HERE = [
  { name: "Cornhole", note: "Boards out, beer in the other hand." },
  { name: "Outdoor seating", note: "Open when the weather cooperates." },
];

/** BAY 06. The beer garden: outdoor seating and the cornhole boards. */
export function BeerGarden() {
  return (
    <section id="garden" aria-labelledby="garden-title" className="section bg-ink-0">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <BayLabel n="06">The beer garden</BayLabel>
          <h2 id="garden-title" className="t-display mt-7 text-[clamp(3.4rem,8.4vw,8rem)] text-foam">
            Take it <span className="text-gold-hi">outside.</span>
          </h2>
          <p className="measure mt-7 text-lg leading-relaxed text-text-2 md:text-xl">
            The beer garden is where the cornhole boards live, with room to sit and pour one when the weather&rsquo;s on our side.
          </p>
          <ul className="mt-10 max-w-2xl border-t border-line">
            {OUT_HERE.map((g) => (
              <li key={g.name} className="flex flex-wrap items-baseline gap-x-4 border-b border-line py-3.5">
                <span className="t-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-none text-foam">{g.name}</span>
                <span className="t-serif text-[1.15rem] text-mortar">{g.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <PhotoSlot label="the beer garden" ratio="4 / 3" tilt={-2} className="mx-auto w-[min(100%,520px)]" />
        </div>
      </div>
    </section>
  );
}
