"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { Confirm } from "@/components/ui/primitives";
import { MENU, beerById, price, type MenuItem } from "@/lib/data";
import { FOOD_PHOTOS } from "./foodPhotos";
import "./kitchen.css";

function Item({ item }: { item: MenuItem }) {
  const pair = item.pairsWith ? beerById(item.pairsWith) : undefined;
  return (
    <li className={item.addon ? "kit-addon" : "kit-item"}>
      <div className="kit-row">
        <span className="kit-name">{item.addon ? `+ ${item.name}` : item.name}</span>
        <span aria-hidden className="kit-leader" />
        <span className={`tabular kit-price`}>{price(item.price)}</span>
      </div>
      {item.detail ? <p className="kit-detail">{item.detail}</p> : null}
      {pair ? (
        <p className="kit-pairRow">
          <span className="kit-pair">
            Pairs with <strong>{pair.short}</strong>
          </span>
          <span className={`t-mono kit-pairNote`}>House suggestion</span>
          <Confirm title="Our suggestion for the concept. Owners to confirm or remove." />
        </p>
      ) : null}
    </li>
  );
}

function Photo({ id, dish }: { id: string; dish: string }) {
  const p = FOOD_PHOTOS[id];
  if (!p) return null;
  return (
    <figure className="kit-photo">
      <picture>
        <source srcSet={`${p.src}.avif`} type="image/avif" />
        <img src={`${p.src}.webp`} alt={p.alt} width={900} height={1117} loading="lazy" decoding="async" />
      </picture>
      <figcaption>
        <span className="kit-photoDish">{dish}</span>
        {p.illustrative ? <span className={`t-mono kit-photoNote`}>Illustrative, not the actual dish</span> : null}
      </figcaption>
    </figure>
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

  // keep the active pill visible in the phone's horizontal bar (no page scroll)
  useEffect(() => {
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
          const withPhoto = c.items.find((i) => i.image && FOOD_PHOTOS[i.image]);
          return (
            <section key={c.id} id={`menu-${c.id}`} aria-labelledby={`menu-h-${c.id}`} className="kit-category">
              <header className="kit-catHead">
                <h4 id={`menu-h-${c.id}`} className="t-stencil text-[1.55rem] leading-none text-gold">
                  {c.name}
                </h4>
                <span aria-hidden className="kit-catRule" />
              </header>
              <div className={withPhoto ? "kit-withPhoto" : undefined}>
                <ul className="kit-items">
                  {c.items.map((i) => (
                    <Item key={i.name} item={i} />
                  ))}
                </ul>
                {withPhoto ? <Photo id={withPhoto.image!} dish={withPhoto.name} /> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
