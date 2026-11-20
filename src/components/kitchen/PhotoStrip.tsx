import { MENU, price } from "@/lib/data";
import { FOOD_PHOTOS, FoodPicture, STRIP } from "./foodPhotos";

const itemFor = (key: string) => MENU.categories.flatMap((c) => c.items).find((i) => i.image === key);

/** "From John's Chef Table": the strongest real plates, a swipeable row on phones, one line on desktop. */
export function PhotoStrip() {
  const shots = STRIP.filter((k) => FOOD_PHOTOS[k]);
  return (
    <section aria-labelledby="kit-strip-title" className="kit-strip">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
        <h3 id="kit-strip-title" className="t-serif text-[clamp(1.7rem,3.4vw,2.5rem)] text-gold-hi">
          From John&rsquo;s Chef Table
        </h3>
        <p className="t-mono text-[0.68rem] text-text-2 lg:hidden">Swipe for more</p>
      </div>
      <ul className="kit-stripRow" aria-label="Photos of dishes from the kitchen" tabIndex={0}>
        {shots.map((k) => {
          const item = itemFor(k);
          return (
            <li key={k} className="kit-stripCard">
              <figure>
                <FoodPicture id={k} sizes="(min-width: 1024px) 17vw, (min-width: 640px) 34vw, 68vw" className="kit-stripImg" />
                {item ? (
                  <figcaption className="kit-stripCap">
                    <span>{item.name}</span>
                    {item.price != null ? <span className="t-mono text-gold-hi">{price(item.price)}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
