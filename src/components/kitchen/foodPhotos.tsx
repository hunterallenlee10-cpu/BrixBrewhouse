/**
 * The kitchen's real food photos. Menu items in /data/menu.json point here with "image": "<key>".
 * Files are made by scripts/encode-food.mjs from the originals in /assets/food:
 * /public/img/food/<key>-<width>.{avif,webp}, every one a 4:5 crop with the same light warm grade.
 * To add a photo: drop the original in /assets/food, give it a crop in the script, run it, add an entry here.
 */
export type FoodPhoto = { alt: string; widths: number[] };

export const FOOD_PHOTOS: Record<string, FoodPhoto> = {
  "guys-burger": {
    alt: "Guy's Burger at Brix Brewhouse: 2.5 lb double burger with double cheese, double bacon and two fried eggs.",
    widths: [480, 960, 1000],
  },
  "beer-cheese-pretzel-board": {
    alt: "Beer Cheese Pretzel Board at Brix Brewhouse: a twisted pretzel with smoked sausage, pepper jack, cheddar, pickles, grapes, candied walnuts, beer cheese and grain mustard on a wood board.",
    widths: [480, 960, 1280],
  },
  "crab-pretzel": {
    alt: "Crab Pretzel at Brix Brewhouse: a soft pretzel baked with crab dip, melted cheddar and scallions.",
    widths: [480, 960, 1280],
  },
  "philly-cheesesteak": {
    alt: "Philly Cheesesteak at Brix Brewhouse: shaved steak, onions and melted cheese on a toasted roll, with a pickle spear and a cup of pasta salad.",
    widths: [480, 960, 1280],
  },
  "spinach-salad": {
    alt: "Spinach Salad at Brix Brewhouse: spinach with grilled chicken, bacon, hard-boiled egg, shaved Parmesan and red onion.",
    widths: [480, 960, 1280],
  },
  "bacon-burger": {
    alt: "Bacon Burger at Brix Brewhouse: bacon, lettuce and tomato on a brioche bun, with pasta salad and a pickle.",
    widths: [480, 728],
  },
};

/** The order of the "From John's Chef Table" strip: the strongest shots, Guy's Burger and the board first. */
export const STRIP = ["guys-burger", "beer-cheese-pretzel-board", "crab-pretzel", "philly-cheesesteak", "spinach-salad"];

export const photoSrc = (key: string, w: number, ext: "avif" | "webp") => `/img/food/${key}-${w}.${ext}`;
export const srcSet = (key: string, ext: "avif" | "webp") =>
  FOOD_PHOTOS[key].widths.map((w) => `${photoSrc(key, w, ext)} ${w}w`).join(", ");

/** A 4:5 food photo: AVIF with a WebP fallback, lazy, sized by `sizes`. */
export function FoodPicture({ id, sizes, className = "" }: { id: string; sizes: string; className?: string }) {
  const p = FOOD_PHOTOS[id];
  if (!p) return null;
  const w = p.widths;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={sizes} />
      <img
        src={photoSrc(id, w[Math.min(1, w.length - 1)], "webp")}
        srcSet={srcSet(id, "webp")}
        sizes={sizes}
        alt={p.alt}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
