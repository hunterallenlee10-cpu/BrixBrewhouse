import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { BayLabel } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";
import { FlapBoard } from "./FlapBoard";
import { Shuffleboard } from "./Shuffleboard";

/** BAY 06. The run board for the week, then the games. */
export function DispatchBoard() {
  return (
    <section id="dispatch" aria-labelledby="dispatch-title" className="section bg-black">
      <div className="wrap">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <BayLabel n="06">What&rsquo;s happening</BayLabel>
            <h2 id="dispatch-title" className="t-display mt-7 text-[clamp(3.4rem,7.4vw,7.2rem)] text-foam">
              Something&rsquo;s on every week.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="measure text-lg text-text-2">
              Live music, trivia, karaoke, open mic, watch parties and seasonal events. Taco Tuesday is the one with a fixed day. For everything
              else, Facebook has this week&rsquo;s lineup.
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
          <FlapBoard />
          <p className="t-mono mt-4 text-[0.6875rem] text-text-3">
            Days marked {"{{CONFIRM}}"} are waiting on the owners. This board reads from one file they can edit.
          </p>
        </div>

        {/* PLAY */}
        <div className="mt-28 grid gap-12 lg:grid-cols-12" aria-labelledby="play-title">
          <div className="lg:col-span-4">
            <h3 id="play-title" className="t-display text-[clamp(3rem,6vw,5.4rem)] text-foam">
              Play.
            </h3>
            <p className="t-serif mt-3 text-[clamp(1.5rem,2.6vw,2.1rem)] text-mortar">Pool, cornhole and the firemen&rsquo;s own table.</p>
          </div>
          <div className="lg:col-span-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="t-display text-[clamp(1.8rem,3.4vw,2.8rem)] text-foam">The original shuffleboard</p>
              <p className="t-mono hidden text-[0.6875rem] text-text-3 sm:block">Still in play</p>
            </div>
            <p className="mt-2 max-w-[52ch] text-text-2">The table the firemen played on is still here, and it&rsquo;s still in play.</p>
            <div className="mt-7 pb-3">
              <Shuffleboard />
            </div>
            <p className="t-mono mt-10 text-[0.72rem] text-gold">Also on the floor</p>
            <ul className="mt-3 border-t border-line">
              <li className="flex flex-wrap items-baseline gap-x-4 border-b border-line py-3">
                <span className="t-display text-[clamp(1.4rem,2.4vw,1.9rem)] text-foam">Pool tables</span>
                <span className="t-serif text-[1.15rem] text-mortar">Rack &rsquo;em up between rounds.</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-x-4 border-b border-line py-3">
                <span className="t-display text-[clamp(1.4rem,2.4vw,1.9rem)] text-foam">Cornhole</span>
                <span className="t-serif text-[1.15rem] text-mortar">Boards out, beer in the other hand.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
