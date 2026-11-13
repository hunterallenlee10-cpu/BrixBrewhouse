// Typed access to the owner-editable JSON in /data.
import taps from "../../data/taps.json";
import menu from "../../data/menu.json";
import events from "../../data/events.json";
import faq from "../../data/faq.json";
import specials from "../../data/specials.json";
import reviews from "../../data/reviews.json";

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
  kind: "house" | "rotating";
  confirmed: boolean;
  description: string;
};

export const TAPS = taps as unknown as {
  updated: string;
  flightSize: number;
  totalTaps: number;
  beers: Beer[];
  guest: { name: string; description: string };
  toGo: string;
  otherDrinks: string[];
};

export type MenuItem = { name: string; price: number; detail?: string; pairsWith?: string; image?: string; addon?: boolean };
export const MENU = menu as unknown as {
  kitchenName: string;
  chef: { name: string; years: number; knownFor: string };
  kitchenHours: string;
  fanFavorite: { beer: string; dish: string; confirm: boolean };
  categories: { id: string; name: string; items: MenuItem[] }[];
};

export type CalendarEvent = { title: string; time?: string; description: string };
export const EVENTS = events as {
  /** YYYY-MM the calendar opens on before the visitor's own date is known */
  month: string;
  weekly: (CalendarEvent & { weekday: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" })[];
  events: (CalendarEvent & { date: string })[];
};
/** Real guest reviews, word for word. */
export const REVIEWS = reviews as { reviews: { quote: string; name: string; source: string; stars?: number; photo?: string }[] };
export const FAQ = faq as { items: { q: string; a: string }[] };
export const SPECIALS = specials as { todaysSpecial: string; soupOfTheDay: string; soupNote: string; tacoTuesday: string };

export const beerById = (id: string) => TAPS.beers.find((b) => b.id === id);
export const price = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);
