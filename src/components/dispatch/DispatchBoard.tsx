import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { BayLabel } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";
import { EventsCalendar } from "./EventsCalendar";

/** BAY 07. The month's events on a calendar. */
export function DispatchBoard() {
  return (
    <section id="dispatch" aria-labelledby="dispatch-title" className="section bg-black">
      <div className="wrap">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <BayLabel n="07">What&rsquo;s happening</BayLabel>
            <h2 id="dispatch-title" className="t-display mt-7 text-[clamp(3.4rem,7.4vw,7.2rem)] text-foam">
              Something&rsquo;s on every week.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="measure text-lg text-text-2">
              Live music, trivia, karaoke, open mic, watch parties and seasonal events.{" "}
              <span className="hidden md:inline">Hover over an event to see what it is. </span>For last-minute changes, check Facebook.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="t-mono inline-flex h-12 items-center gap-2.5 border border-gold px-4 text-[0.7rem] text-gold-hi transition-colors hover:bg-gold hover:text-black"
              >
                <FacebookLogo aria-hidden size={20} weight="fill" />
                Follow on Facebook
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="t-mono inline-flex h-12 items-center gap-2.5 border border-line-strong px-4 text-[0.7rem] text-foam transition-colors hover:border-foam"
              >
                <InstagramLogo aria-hidden size={20} />
                Follow on Instagram
              </a>
            </div>
          </div>
        </header>
        <div className="mt-14">
          <EventsCalendar />
        </div>
      </div>
    </section>
  );
}
