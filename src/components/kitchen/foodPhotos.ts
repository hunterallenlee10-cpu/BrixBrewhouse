/**
 * SWAP POINT for food photography.
 * Menu items in /data/menu.json carry an "image" key (F1-F4) that points here.
 * The four photos here are generated stand-ins. To use a real photo: put it in
 * /public/img as .avif + .webp and change `src` (path without extension) and `alt`.
 */
export type FoodPhoto = { src: string; alt: string };

export const FOOD_PHOTOS: Record<string, FoodPhoto> = {
  F1: {
    src: "/img/food-pretzel-board",
    alt: "A twisted pretzel with cheddar, pepper jack, kielbasa, pickles, grapes, candied walnuts, beer cheese and brown mustard on a wood board",
  },
  F2: {
    src: "/img/food-birch-float",
    alt: "A birch beer float with vanilla ice cream in a tall glass",
  },
  F3: {
    src: "/img/food-bbq-pork",
    alt: "A smoked BBQ pork sandwich with beer cheese, a side and a pickle",
  },
  F4: {
    src: "/img/food-chili-nachos",
    alt: "Tortilla chips with beef chili and cheese sauce",
  },
};
