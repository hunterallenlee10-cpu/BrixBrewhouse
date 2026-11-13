// The six highlighted caps. Every fact comes from the owners.
export type CapStory = {
  id: string;
  figure: string; // stamped on the cap face
  unit: string;
  story: string;
  credit: string;
  color: { base: string; hi: string; lo: string; ink: string };
  /** cut-out cap photo in /public/img/caps (generated) */
  img: string;
  /** degrees to rotate the cap photo's hue, for a colour we have no photo of */
  hue?: number;
};

export const STORIES: CapStory[] = [
  {
    id: "hours",
    figure: "10,000+",
    unit: "Hours",
    story: "Renovating Brix took 10 months. Some days, 14 people were working at the same time.",
    credit: "The whole crew",
    color: { base: "#b5121f", hi: "#ff5a5f", lo: "#5e060d", ink: "#f2f2f2" },
    img: "red",
  },
  {
    id: "carpentry",
    figure: "107",
    unit: "Days",
    story: "Joe Elias Sr., Joe's father, did all the carpentry in Eli's Lounge.",
    credit: "J. Elias Sr.",
    color: { base: "#c99a2e", hi: "#f6d77f", lo: "#6d4d0d", ink: "#17181b" },
    img: "gold",
  },
  {
    id: "shuffleboard",
    figure: "70+",
    unit: "Years old",
    story: "The firemen's original shuffleboard table, 70+ years old. Still in play.",
    credit: "West End firehouse",
    color: { base: "#9fa4a9", hi: "#eef1f3", lo: "#4a4f54", ink: "#17181b" },
    img: "silver",
  },
  {
    id: "stage",
    figure: "Stage",
    unit: "Room",
    story: "Music has always been a part of the firehall. The tradition continues in the new Stage Room.",
    credit: "The firehall",
    color: { base: "#1f4f8a", hi: "#6ea4e6", lo: "#0c2444", ink: "#f2f2f2" },
    img: "red",
    hue: 222,
  },
  {
    id: "art",
    figure: "Art",
    unit: "Local",
    story: "Murals and paintings by local artist Larry Meng, including a firetruck he painted in the 1990s.",
    credit: "L. Meng",
    color: { base: "#1d1e22", hi: "#6a6c74", lo: "#050506", ink: "#f2f2f2" },
    img: "gunmetal",
  },
  {
    id: "year",
    figure: "1953",
    unit: "In service",
    story: "The year the building went into service as the West End Firehouse.",
    credit: "West End Firehouse",
    color: { base: "#d8ccb2", hi: "#fffaf0", lo: "#7d7259", ink: "#17181b" },
    img: "cream",
  },
];
