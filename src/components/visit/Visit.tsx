import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { BayLabel, Illustrative } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/StatusPill";
import { HOURS } from "@/lib/hours";
import { SITE } from "@/lib/site";
import { HoursTable } from "./HoursTable";
import { MapPanel } from "./MapPanel";
import { RidgeVideo } from "./RidgeVideo";

const GOOD_TO_KNOW = [
  "Family-friendly",
  "Wheelchair accessible",
  "Free Wi-Fi",
  "Outdoor seating (weather permitting)",
  "Walk-ins welcome",
  "No dogs (for now)",
  "Gift cards",
  "Merch",
];

export function Visit() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden bg-black pb-[clamp(5rem,10vw,8rem)]">
      {/* golden-hour ridge behind the heading, fading into the night */}
      <div aria-hidden={false} className="absolute inset-x-0 top-0 h-[78svh] min-h-[520px] overflow-hidden">
        <RidgeVideo className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black" />
        <Illustrative className="absolute bottom-6 right-6 md:right-24" />
      </div>
      {/* brick side bands: the firehouse wall framing the view */}
      <div aria-hidden className={`visit-band visit-bandLeft mat-brick`} />
      <div aria-hidden className={`visit-band visit-bandRight mat-brick`} />

      <div className="wrap relative pt-[clamp(6rem,14vw,11rem)]">
        <BayLabel n="08">Visit</BayLabel>
        <h2 id="visit-title" className="t-serif mt-6 max-w-[12ch] pb-2 text-[clamp(3.4rem,10vw,9.5rem)] leading-[1.02] text-foam [text-shadow:0_6px_50px_rgb(0_0_0/0.6)]">
          We&rsquo;ll save you a seat.
        </h2>
        <div className="mt-8">
          {/* scaled up for presence; scale doesn't reserve layout, so the note sits on its own line */}
          <div className="origin-left scale-[1.15] md:scale-[1.35]">
            <StatusPill tone="glass" />
          </div>
          <p className="t-mono mt-5 text-[0.68rem] text-text-2 md:mt-8">{HOURS.holidayNote}</p>
        </div>

        <div className="mt-[clamp(4rem,9vw,7rem)] grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* left: where + how */}
          <div className="flex flex-col gap-10 lg:col-span-5">
            <address className="not-italic">
              <span className="t-display block text-[clamp(2.6rem,5.4vw,4.4rem)] text-foam">{SITE.street}</span>
              <span className="mt-1 block text-xl text-text-2">
                {SITE.city}, {SITE.region} {SITE.zip}
              </span>
              <span className="t-mono mt-3 block text-[0.7rem] text-gold">{SITE.formerly}</span>
            </address>

            <div className="flex flex-col gap-3">
              <a
                href={SITE.directions}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="cap"
                className="group flex min-h-16 items-center justify-between gap-4 bg-red px-6 font-display text-[1.45rem] font-extrabold uppercase tracking-[0.02em] text-foam shadow-[0_14px_34px_-14px_rgb(234_3_34/0.7)] transition-colors hover:bg-red-deep"
              >
                <span className="flex items-center gap-3">
                  <MapPin aria-hidden size={24} weight="bold" /> Get directions
                </span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <a
                  href={SITE.phoneHref}
                  className="flex min-h-14 items-center gap-3 border border-line-strong px-5 font-display text-[1.2rem] font-bold uppercase text-foam transition-colors hover:border-foam"
                >
                  <Phone aria-hidden size={20} className="text-gold-hi" /> Call {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex min-h-14 items-center gap-3 border border-line-strong px-5 font-display text-[1.2rem] font-bold uppercase text-foam transition-colors hover:border-foam"
                >
                  <EnvelopeSimple aria-hidden size={20} className="text-gold-hi" /> Email us
                </a>
              </div>
              <p className="text-sm text-text-3">
                {SITE.email} · Large group? Call ahead and we&rsquo;ll make room.
              </p>
            </div>

            <div>
              <h3 className="t-mono mb-3 text-[0.7rem] text-text-2">Hours · Eastern time</h3>
              <HoursTable />
            </div>
          </div>

          {/* right: the map */}
          <div className="lg:col-span-7 lg:pt-3">
            <MapPanel />
          </div>
        </div>

        {/* good to know */}
        <div className="mt-[clamp(4rem,8vw,6rem)]">
          <h3 className="t-display text-[clamp(2rem,4vw,3rem)] text-foam">Good to know</h3>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {GOOD_TO_KNOW.map((c) => (
              <li key={c} className={`visit-chip t-mono inline-flex min-h-11 items-center px-4 text-[0.7rem] text-foam`}>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* sample reviews: clearly templates, never presented as real */}
        <div className="mt-[clamp(4rem,8vw,6rem)] grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <figure key={i} className={`visit-sample p-6 md:p-8`} aria-label="Sample review placeholder">
              <p className="t-mono text-[0.62rem] text-gold">Sample: replace with a real guest review</p>
              <blockquote className="t-serif mt-4 text-[clamp(1.4rem,2.4vw,1.9rem)] text-text-3">
                [A real guest review goes here: two or three lines, quoted with permission.]
              </blockquote>
              <figcaption className="t-mono mt-5 text-[0.62rem] text-text-3">[Guest name] · [Google or Facebook]</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
