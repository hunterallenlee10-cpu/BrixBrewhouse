// The word BRIX as real brickwork: each letter is a bitmap, laid in running bond
// (odd courses offset by half a brick), so edges break where a mason's would.
import faces from "./brickFaces.json";

const LETTERS: Record<string, string[]> = {
  B: ["#####.", "##..##", "##..##", "##..##", "#####.", "##..##", "##..##", "##..##", "#####."],
  R: ["#####.", "##..##", "##..##", "##..##", "#####.", "####..", "##.##.", "##..##", "##..##"],
  I: ["######", "######", "..##..", "..##..", "..##..", "..##..", "..##..", "######", "######"],
  X: ["##..##", "##..##", ".#..#.", ".####.", "..##..", ".####.", ".#..#.", "##..##", "##..##"],
};

const LETTER_W = 6;
const LETTER_GAP = 2;
const LETTER_H = 9;
const LINE_GAP = 1; // empty course between stacked lines
/** course height relative to one unit of width (a brick is 2 units long) */
export const COURSE = 0.74;

export type Layout = "one" | "two";

export type Brick = {
  id: number;
  col: number;
  w: number; // 1 (half bat) or 2 (full brick)
  row: number; // 0 = top course
  up: number; // courses from the bottom (0 = first laid)
  bg: string;
  size: string;
  pos: string;
  rand: number; // 0..1, stable per brick
};

export type BrickWord = {
  cols: number;
  rows: number;
  bricks: Brick[];
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildBricks(layout: Layout = "one"): BrickWord {
  const lines = layout === "one" ? ["BRIX"] : ["BR", "IX"];
  const cols = Math.max(...lines.map((l) => l.length * LETTER_W + (l.length - 1) * LETTER_GAP));
  const rows = lines.length * LETTER_H + (lines.length - 1) * LINE_GAP;
  // full bitmap, one string per course
  const grid: string[] = [];
  lines.forEach((word, li) => {
    if (li > 0) for (let g = 0; g < LINE_GAP; g++) grid.push(".".repeat(cols));
    for (let r = 0; r < LETTER_H; r++) {
      const line = word
        .split("")
        .map((ch) => LETTERS[ch][r])
        .join(".".repeat(LETTER_GAP));
      grid.push(line.padEnd(cols, "."));
    }
  });

  const rnd = mulberry(1894);
  const { w: TW, h: TH, src } = faces;
  const bricks: Brick[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    const filled = (c: number) => c >= 0 && c < cols && grid[r][c] === "#";
    for (let c = r % 2 === 0 ? 0 : -1; c < cols; c += 2) {
      const a = filled(c);
      const b = filled(c + 1);
      if (!a && !b) continue;
      const f = faces.faces[Math.floor(rnd() * faces.faces.length)];
      let [x0, , x1] = f;
      const [, y0, , y1] = f;
      const w = a && b ? 2 : 1;
      if (w === 1) {
        const half = (x1 - x0) / 2;
        if (rnd() > 0.5) x0 += half;
        else x1 -= half;
      }
      const fw = x1 - x0;
      const fh = y1 - y0;
      const shade = rnd() * 0.34 - 0.1; // firing variation: a few bricks lighter, most a touch darker
      const tint = shade < 0 ? `rgb(255 214 180 / ${(-shade).toFixed(3)})` : `rgb(14 5 2 / ${shade.toFixed(3)})`;
      bricks.push({
        id: id++,
        col: a && b ? c : a ? c : c + 1,
        w,
        row: r,
        up: rows - 1 - r,
        bg: `linear-gradient(${tint}, ${tint}), url(${src})`,
        size: `100% 100%, ${((TW / fw) * 100).toFixed(1)}% ${((TH / fh) * 100).toFixed(1)}%`,
        pos: `0 0, ${((x0 / (TW - fw)) * 100).toFixed(2)}% ${((y0 / (TH - fh)) * 100).toFixed(2)}%`,
        rand: rnd(),
      });
    }
  }

  return { cols, rows, bricks };
}
