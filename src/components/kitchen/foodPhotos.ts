/**
 * SWAP POINT for food photography.
 * Menu items in /data/menu.json carry an "image" key (F1-F4) that points here.
 * To use a real photo: put it in /public/img as .avif + .webp, change `src`
 * (path without extension) and set `illustrative: false`. The
 * "Illustrative, not the actual dish" caption disappears on its own.
 */
export type FoodPhoto = { src: string; alt: string; illustrative: boolean };

export const FOOD_PHOTOS: Record<string, FoodPhoto> = {
  F1: {
    src: "/img/food-pretzel-board",
    alt: "A twisted pretzel with cheddar, pepper jack, kielbasa, pickles, grapes, candied walnuts, beer cheese and brown mustard on a wood board",
    illustrative: true,
  },
  F2: {
    src: "/img/food-birch-float",
    alt: "A birch beer float with vanilla ice cream in a tall glass",
    illustrative: true,
  },
  F3: {
    src: "/img/food-bbq-pork",
    alt: "A smoked BBQ pork sandwich with beer cheese, a side and a pickle",
    illustrative: true,
  },
  F4: {
    src: "/img/food-chili-nachos",
    alt: "Tortilla chips with beef chili and cheese sauce",
    illustrative: true,
  },
};
