import { Phone } from "@phosphor-icons/react/dist/ssr";
import { BayLabel } from "@/components/ui/primitives";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { TAPS } from "@/lib/data";
import { SITE } from "@/lib/site";
import { Shuffleboard } from "./Shuffleboard";
import { Tally } from "./Tally";

const USES = [
  { name: "Birthdays", note: "Family-friendly" },
  { name: "Showers", note: "Kids menu" },
  { name: "Repasts", note: "Room to gather" },
  { name: "Team nights", note: `${TAPS.totalTaps} taps` },
  { name: "Fundraisers", note: "Local causes" },
  { name: "Watch parties", note: "Bring the crew" },
];

const ALSO = [
  { name: "Foosball", note: "Grab a partner." },
  { name: "Pool", note: "Rack ’em up between rounds." },
];

/** BAY 05. The room one man built: Joe Elias Sr. ("Eli"), 107 days, every piece of carpentry. Then the games in it. */
export function ElisLounge() {
  return (
    <section id="lounge" aria-labelledby="lounge-title" className="section mat-walnut elx-room">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        {/* story */}
        <div className="lg:col-span-7">
          <BayLabel n="05">Eli&rsquo;s Lounge / Private events</BayLabel>
          <h2 id="lounge-title" className="mt-7">
            <span className="t-display block text-[clamp(3.6rem,10.5vw,9.5rem)] text-foam">Eli&rsquo;s Lounge.</span>
            <span className="t-serif mt-2 block pb-2 text-[clamp(2.6rem,7vw,6rem)] leading-[1.1] text-gold-hi">Built by Joe Elias Sr.</span>
          </h2>
          <p className="measure mt-8 text-lg leading-relaxed text-text-2 md:text-xl">
            Eli&rsquo;s Lounge is the main bar at Brix, and every piece of carpentry in it was done by one man:{" "}
            <strong className="font-semibold text-foam">Joe Elias Sr.</strong>, nicknamed Eli, Joe&rsquo;s 75-year-old father. It took him{" "}
            <strong className="font-semibold text-foam">107 days</strong>. Book it for your people and you&rsquo;re sitting inside his work. It&rsquo;s our
            private event space; you can reserve space anywhere else in the brewery too.
          </p>

          <ul className="elx-ledger mt-12 max-w-2xl" aria-label="Good for">
            {USES.map((u) => (
              <li key={u.name} className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="t-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-none text-foam">{u.name}</span>
                <span className="t-mono shrink-0 text-[0.6875rem] text-text-2">{u.note}</span>
              </li>
            ))}
          </ul>
          {/* paraphrased from their site, not a quote */}
          <p className="t-serif mt-6 max-w-xl border-l border-gold/50 pl-4 text-[1.35rem] leading-snug text-foam/90">
            Brix has said it will champion local causes and host fundraisers here.
          </p>
        </div>

        {/* the board: 107 days, one stroke each */}
        <div className="lg:col-span-5 lg:pt-24">
          <figure className="elx-board px-7 pb-8 pt-7 sm:px-9">
            <figcaption className="t-mono text-[0.6875rem] text-gold-hi">Log: 107 days / carpentry / J. Elias Sr.</figcaption>
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
            <p className="sr-only">107 tally marks, one for each day Joe Elias Sr. spent building the room.</p>
            <dl className="mt-9 grid grid-cols-2 gap-px border-t border-foam/15 pt-5">
              <div>
                <dt className="t-mono text-[0.6875rem] text-text-3">Taps</dt>
                <dd className="t-display mt-1 text-4xl text-foam">{TAPS.totalTaps}</dd>
              </div>
              <div>
                <dt className="t-mono text-[0.6875rem] text-text-3">Carpenter</dt>
                <dd className="mt-1 text-lg text-foam">Joe Elias Sr., age 75</dd>
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

      {/* PLAY: the games in the lounge */}
      <div className="wrap mt-24 md:mt-28">
        <div className="grid gap-12 border-t border-foam/15 pt-14 lg:grid-cols-12 lg:pt-16">
          <div className="lg:col-span-4">
            <h3 className="t-display text-[clamp(3rem,6vw,5.4rem)] text-foam">Play.</h3>
            <p className="t-serif mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)] text-mortar">Shuffleboard, foosball and pool.</p>
          </div>
          <div className="lg:col-span-8">
            <p className="t-display text-[clamp(1.8rem,3.4vw,2.8rem)] text-foam">The original shuffleboard</p>
            <p className="mt-2 max-w-[52ch] text-text-2">
              The table the firemen played on is 70+ years old. It&rsquo;s still here, and it&rsquo;s still in play.
            </p>
            <div className="mt-7 pb-3">
              <Shuffleboard />
            </div>
            <p className="t-mono mt-10 text-[0.72rem] text-gold-hi">Also in the lounge</p>
            <ul className="mt-3 border-t border-foam/15">
              {ALSO.map((g) => (
                <li key={g.name} className="flex flex-wrap items-baseline gap-x-4 border-b border-foam/15 py-3">
                  <span className="t-display text-[clamp(1.4rem,2.4vw,1.9rem)] text-foam">{g.name}</span>
                  <span className="t-serif text-[1.15rem] text-mortar">{g.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
