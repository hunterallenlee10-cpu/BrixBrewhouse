// The rooms of the building, in scroll order. Used by the nav and the Brix Gauge.
export const ROOMS = [
  { id: "top", label: "The Door", short: "Door" },
  { id: "brix", label: "Three Meanings", short: "Brix" },
  { id: "on-tap", label: "On Tap", short: "On Tap" },
  { id: "bar-top", label: "The Bar Top", short: "Bar Top" },
  { id: "kitchen", label: "Kitchen", short: "Kitchen" },
  { id: "lounge", label: "Eli's Lounge", short: "Lounge" },
  { id: "dispatch", label: "What's Happening", short: "Events" },
  { id: "press", label: "Press", short: "Press" },
  { id: "visit", label: "Visit", short: "Visit" },
  { id: "faq", label: "FAQ", short: "FAQ" },
] as const;

export const NAV_LINKS = [
  { id: "on-tap", label: "On Tap" },
  { id: "kitchen", label: "Menu" },
  { id: "lounge", label: "Eli's Lounge" },
  { id: "dispatch", label: "Events" },
  { id: "visit", label: "Visit" },
] as const;
