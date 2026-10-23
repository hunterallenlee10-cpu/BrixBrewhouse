// Typed access to the owner-editable JSON in /data.
import taps from "../../data/taps.json";
import menu from "../../data/menu.json";
import events from "../../data/events.json";
import faq from "../../data/faq.json";
import specials from "../../data/specials.json";

export type Beer = {
  id: string;
  tap?: number;
  name: string;
  short: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  color: string | null;
  liquid: string;
  foam?: string;
  haze: number;
  kind: "house" | "rotating" | "na";
  confirmed: boolean;
  description: string;
};

export const TAPS = taps as unknown as {
  updated: string;
  flightSize: number;
  totalTaps: number;
  beers: Beer[];
  nonAlcoholic: Beer;
  guest: { name: string; description: string };
  toGo: string;
  otherDrinks: string[];
};

export type MenuItem = { name: string; price: number; detail?: string; pairsWith?: string; image?: string; addon?: boolean };
export const MENU = menu as unknown as {
  kitchenName: string;
  chef: { name: string; years: number; knownFor: string };
  kitchenHours: string;
  kitchenHoursNote: string;
  allDay: string;
  fanFavorite: { beer: string; dish: string; confirm: boolean };
  categories: { id: string; name: string; items: MenuItem[] }[];
};

export const EVENTS = events as {
  rows: { event: string; day: string | null; status: string; confirmed: boolean }[];
  play: string[];
};
export const FAQ = faq as { items: { q: string; a: string }[] };
export const SPECIALS = specials as { todaysSpecial: string; soupOfTheDay: string; soupNote: string; tacoTuesday: string };

export const beerById = (id: string) => [...TAPS.beers, TAPS.nonAlcoholic].find((b) => b.id === id);
export const price = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);
