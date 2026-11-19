"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { MENU, beerById, price, type MenuItem } from "@/lib/data";
import { FOOD_PHOTOS, FoodPicture } from "./foodPhotos";

function Item({ item }: { item: MenuItem }) {
  // a beer id from taps.json, or a plain beer name for a pour that isn't on the tap list yet
  const pair = item.pairsWith ? (beerById(item.pairsWith)?.short ?? item.pairsWith) : undefined;
  const photo = item.image && FOOD_PHOTOS[item.image] ? item.image : null;
  return (
    <li className={item.addon ? "kit-addon" : photo ? "kit-item kit-hasThumb" : "kit-item"}>
      {photo ? <FoodPicture id={photo} sizes="80px" className="kit-thumb" /> : null}
      <div className="min-w-0">
        <div className="kit-row">
          <span className="kit-name">{item.addon ? `+ ${item.name}` : item.name}</span>
          {item.price != null ? (
            <>
              <span aria-hidden className="kit-leader" />
              <span className={`tabular kit-price`}>{price(item.price)}</span>
            </>
          ) : null}
        </div>
        {item.detail ? <p className="kit-detail">{item.detail}</p> : null}
        {pair ? (
          <p className="kit-pairRow">
            <span className="kit-pair">
              Pairs with <strong>{pair}</strong>
            </span>
            <span className={`t-mono kit-pairNote`}>House pairing</span>
          </p>
        ) : null}
      </div>
    </li>
  );
}

/** A bold card for a signature dish (Guy's Burger): the photo large, the facts in one line. */
function Feature({ item }: { item: MenuItem }) {
  return (
    <article className="kit-feature" aria-label={item.name}>
      {item.image ? <FoodPicture id={item.image} sizes="(min-width: 1024px) 200px, 38vw" className="kit-featureImg" /> : null}
      <div className="kit-featureText">
        <p className="t-mono text-[0.6875rem] text-gold">House legend</p>
        <p className="t-display mt-2 text-[clamp(2rem,3.2vw,2.6rem)] leading-[0.9] text-foam">{item.name}</p>
        {item.detail ? <p className="mt-3 font-semibold leading-snug text-foam/90">{item.detail}</p> : null}
        {item.price != null ? <p className="t-mono mt-3 text-[0.92rem] text-gold-hi">{price(item.price)}</p> : null}
      </div>
    </article>
  );
}

/**
 * The real menu as an editorial two-column page. The category bar jumps to
 * each section, tracks where you are, and sticks under the nav on phones.
 */
export function Menu() {
  const { scrollTo } = useSite();
  const [active, setActive] = useState(MENU.categories[0].id);
  const bar = useRef<HTMLDivElement>(null);
  // after a click, hold the chosen category while the page glides there
  const locked = useRef(false);
  const lockTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(lockTimer.current), []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (locked.current) return;
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("menu-", ""));
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    MENU.categories.forEach((c) => {
      const el = document.getElementById(`menu-${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // keep the active pill visible in the phone's horizontal bar (no page scroll).
  // Skipped on mount: nothing has changed yet, and reading offsets there forces a full layout.
  const firstActive = useRef(true);
  useEffect(() => {
    if (firstActive.current) {
      firstActive.current = false;
      return;
    }
    const b = bar.current;
    const pill = b?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!b || !pill) return;
    const left = pill.offsetLeft - b.clientWidth / 2 + pill.clientWidth / 2;
    b.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const jump = (id: string) => {
    locked.current = true;
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => (locked.current = false), 1600);
    setActive(id);
    const phone = window.matchMedia("(max-width: 1023px)").matches;
    scrollTo(`#menu-${id}`, { duration: 1.1, offset: phone ? -132 : -96 });
  };

  return (
    <div id="menu" className="kit-menu">
      <div className="kit-menuHead">
        <h3 className="t-display text-[clamp(2.6rem,6vw,4.6rem)] text-foam">The menu</h3>
        <p className="t-mono text-[0.68rem] text-text-2">Prices from the current menu</p>
      </div>

      <div ref={bar} className="kit-catBar">
        <nav aria-label="Menu categories">
          <ul className="kit-catList">
            {MENU.categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`#menu-${c.id}`}
                  data-cat={c.id}
                  aria-current={active === c.id ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(c.id);
                  }}
                  className={`t-mono kit-cat`}
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="kit-columns">
        {MENU.categories.map((c) => {
          const featured = c.items.filter((i) => i.featured);
          return (
            <section key={c.id} id={`menu-${c.id}`} aria-labelledby={`menu-h-${c.id}`} className="kit-category">
              <header className="kit-catHead">
                <h4 id={`menu-h-${c.id}`} className="t-stencil text-[1.55rem] leading-none text-gold">
                  {c.name}
                </h4>
                <span aria-hidden className="kit-catRule" />
              </header>
              {featured.map((i) => (
                <Feature key={i.name} item={i} />
              ))}
              <ul className="kit-items">
                {c.items
                  .filter((i) => !i.featured)
                  .map((i) => (
                    <Item key={i.name} item={i} />
                  ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
