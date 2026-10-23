// The six highlighted caps. Every fact comes from the brief; 1953 is still to be confirmed.
export type CapStory = {
  id: string;
  figure: string; // stamped on the cap face
  unit: string;
  log: string; // mono log line on the back
  story: string;
  credit: string;
  confirm?: boolean;
  color: { base: string; hi: string; lo: string; ink: string };
};

export const STORIES: CapStory[] = [
  {
    id: "caps",
    figure: "40",
    unit: "Hours",
    log: "40 hours / bar top",
    story: "Lindsay Elias placed every bottle cap under this glass by hand.",
    credit: "L. Elias",
    color: { base: "#b5121f", hi: "#ff5a5f", lo: "#5e060d", ink: "#f2f2f2" },
  },
  {
    id: "carpentry",
    figure: "107",
    unit: "Days",
    log: "107 days / carpentry",
    story: "Eli Elias, Joe's father, did all the carpentry in Eli's Lounge.",
    credit: "E. Elias",
    color: { base: "#c99a2e", hi: "#f6d77f", lo: "#6d4d0d", ink: "#17181b" },
  },
  {
    id: "shuffleboard",
    figure: "1",
    unit: "Shuffleboard",
    log: "1 shuffleboard / original",
    story: "The firemen's original table. Still in play.",
    credit: "West End firehouse",
    color: { base: "#9fa4a9", hi: "#eef1f3", lo: "#4a4f54", ink: "#17181b" },
  },
  {
    id: "doors",
    figure: "5",
    unit: "Bay doors",
    log: "5 bay doors / glass",
    story: "Glass now. Look through them and you'll see the brewhouse.",
    credit: "The old bays",
    color: { base: "#2c5b3c", hi: "#6fb486", lo: "#11281a", ink: "#f2f2f2" },
  },
  {
    id: "art",
    figure: "Art",
    unit: "Local",
    log: "Local art / L. Meag",
    story: "Murals and paintings by local artist Larry Meag, including a firetruck he painted in the 1990s.",
    credit: "L. Meag",
    color: { base: "#1d1e22", hi: "#6a6c74", lo: "#050506", ink: "#f2f2f2" },
  },
  {
    id: "year",
    figure: "1953",
    unit: "In service",
    log: "1953 / West End Firehouse",
    story: "The year the building went into service as the West End Firehouse.",
    credit: "Year to confirm",
    confirm: true,
    color: { base: "#d8ccb2", hi: "#fffaf0", lo: "#7d7259", ink: "#17181b" },
  },
];

/** Crimped bottle-cap outline in a 100x100 box. */
export function crimpPath(n = 24, R = 49, r = 45.5) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r : R;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
