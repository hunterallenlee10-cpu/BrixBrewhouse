import { BayLabel, Confirm, PhotoSlot } from "@/components/ui/primitives";
import { MENU } from "@/lib/data";
import { Chalkboard } from "./Chalkboard";
import { Menu } from "./Menu";
import "./kitchen.css";

/** BAY 04. John's Chef Table: the chef, the chalkboard, the real menu. */
export function Kitchen() {
  const { chef } = MENU;
  return (
    <section id="kitchen" aria-labelledby="kitchen-title" className={`section kit-kitchen`}>
      <div className="wrap">
        <div className="kit-intro">
          <div className="kit-introText">
            <BayLabel n="04">The kitchen</BayLabel>
            <h2 id="kitchen-title" className="t-display mt-6 text-[clamp(3.6rem,10vw,8.5rem)] leading-[0.84] text-foam">
              John&rsquo;s
              <br />
              Chef Table
            </h2>
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-text-2">
              Chef {chef.name} has spent {chef.years} years in kitchens, and he&rsquo;s best known for {chef.knownFor}. The meats are smoked in
              house, many ingredients are locally sourced, and the specials go up on the chalkboard every day.
            </p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-text-2">
              Dishes the press has written up: a creamy chicken buffalo soup, house-smoked pulled pork, a coffee and black pepper crusted
              brisket and a Thai chicken wrap. Ask what&rsquo;s cooking today.
            </p>

            <dl className="kit-facts">
              <div>
                <dt className="t-mono">Kitchen hours</dt>
                <dd>
                  <Confirm title={MENU.kitchenHoursNote} />
                  <span className="kit-factNote">12-3 and 5-8, or the full menu until 8 PM daily?</span>
                </dd>
              </div>
              <div>
                <dt className="t-mono">All day</dt>
                <dd>{MENU.allDay}</dd>
              </div>
              <div>
                <dt className="t-mono">Tuesdays</dt>
                <dd>Taco Tuesday.</dd>
              </div>
            </dl>
          </div>

          <div className="kit-introBoard">
            <Chalkboard />
            <PhotoSlot label="Chef John" note="At the pass, in his kitchen" ratio="4 / 5" tilt={-3} className="kit-chefSlot" />
          </div>
        </div>

        <aside className="kit-favorite" aria-label="Fan favorite pairing">
          <p className="t-mono text-[0.68rem] text-gold">Fan favorite pairing</p>
          <p className="t-serif mt-2 text-[clamp(1.7rem,3.6vw,2.6rem)] text-foam">
            {MENU.fanFavorite.beer} + {MENU.fanFavorite.dish} <Confirm title="Mentioned in press coverage; owners to confirm" />
          </p>
          <p className="mt-2 text-sm text-text-2">A crowd favorite in the press. Ask if it&rsquo;s on today.</p>
        </aside>

        <Menu />
      </div>
    </section>
  );
}
