import { Phone } from "@phosphor-icons/react/dist/ssr";
import { BayLabel } from "@/components/ui/primitives";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { SITE } from "@/lib/site";
import { Tally } from "./Tally";

const USES = [
  { name: "Birthdays", note: "Seats 50" },
  { name: "Showers", note: "Family-friendly" },
  { name: "Team nights", note: "Nine taps" },
  { name: "Fundraisers", note: "Local causes" },
  { name: "Watch parties", note: "Bring the crew" },
];

/** BAY 05. The room one man built: Eli Elias, 107 days, every piece of carpentry. */
export function ElisLounge() {
  return (
    <section id="lounge" aria-labelledby="lounge-title" className="section mat-walnut elx-room">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        {/* story */}
        <div className="lg:col-span-7">
          <BayLabel n="05">Eli&rsquo;s Lounge / Private events</BayLabel>
          <h2 id="lounge-title" className="mt-7">
            <span className="t-display block text-[clamp(3.6rem,10.5vw,9.5rem)] text-foam">Eli&rsquo;s Lounge.</span>
            <span className="t-display block text-[clamp(3.6rem,10.5vw,9.5rem)] text-mortar">Seats 50.</span>
            <span className="t-serif mt-2 block pb-2 text-[clamp(3rem,8vw,7rem)] leading-[1.1] text-gold-hi">Built by Eli.</span>
          </h2>
          <p className="measure mt-8 text-lg leading-relaxed text-text-2 md:text-xl">
            Eli&rsquo;s Lounge is the main bar at Brix, and every piece of carpentry in it was done by one man:{" "}
            <strong className="font-semibold text-foam">Eli Elias</strong>, Joe&rsquo;s 75-year-old father. It took him{" "}
            <strong className="font-semibold text-foam">107 days</strong>. Book it for your people and you&rsquo;re sitting inside his work.
          </p>

          <ul className="elx-ledger mt-12 max-w-2xl" aria-label="Good for">
            {USES.map((u) => (
              <li key={u.name} className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="t-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-none text-foam">{u.name}</span>
                <span className="t-mono shrink-0 text-[0.6875rem] text-text-2">{u.note}</span>
              </li>
            ))}
          </ul>
          <blockquote className="mt-6 max-w-xl border-l border-gold/50 pl-4">
            <p className="t-serif text-[1.35rem] leading-snug text-foam/90">
              &ldquo;We&rsquo;ll champion local causes, host fundraisers, and make sure everyone feels welcome from day one.&rdquo;
            </p>
            <footer className="t-mono mt-2 text-[0.6875rem] text-text-3">Brix Brewhouse</footer>
          </blockquote>
        </div>

        {/* the board: 107 days, one stroke each */}
        <div className="lg:col-span-5 lg:pt-24">
          <figure className="elx-board px-7 pb-8 pt-7 sm:px-9">
            <figcaption className="t-mono text-[0.6875rem] text-gold-hi">Log: 107 days / carpentry / E. Elias</figcaption>
            <p className="mt-4 flex items-end gap-4">
              <span className="t-display text-[clamp(7rem,16vw,12rem)] leading-[0.78] text-foam">107</span>
              <span className="t-serif pb-2 text-[clamp(1.4rem,2.6vw,2rem)] text-mortar">
                days of
                <br />
                carpentry
              </span>
            </p>
            <div className="mt-8">
              <Tally />
            </div>
            <p className="sr-only">107 tally marks, one for each day Eli Elias spent building the room.</p>
            <dl className="mt-9 grid grid-cols-2 gap-px border-t border-foam/15 pt-5">
              <div>
                <dt className="t-mono text-[0.6875rem] text-text-3">Seats</dt>
                <dd className="t-display mt-1 text-4xl text-foam">50</dd>
              </div>
              <div>
                <dt className="t-mono text-[0.6875rem] text-text-3">Carpenter</dt>
                <dd className="mt-1 text-lg text-foam">Eli Elias, age 75</dd>
              </div>
            </dl>
          </figure>

          {/* booking */}
          <div className="mt-10 flex flex-col gap-6">
            <TapHandleButton tab="event" size="lg" className="self-start" />
            <div>
              <p className="t-mono text-[0.6875rem] text-text-2">Large group? Call ahead.</p>
              <a
                href={SITE.phoneHref}
                className="mt-1 inline-flex min-h-11 items-center gap-2 text-xl text-foam underline decoration-gold/60 underline-offset-[0.3em] transition-colors hover:text-gold-hi"
              >
                <Phone aria-hidden size={20} className="text-gold-hi" />
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
