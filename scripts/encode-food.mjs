// The kitchen's real food photos (as received, in assets/food) → tight 4:5 crops with one light warm grade,
// so photos shot on black cloth, steel and in the dining room read as one set.
// Writes public/img/food/<name>-<width>.{avif,webp}. Run: node scripts/encode-food.mjs [name ...] (no names: all)
import sharp from "sharp";
import { existsSync, statSync } from "node:fs";

// [left, top, width, height] in the original's pixels; every box is 4:5
const CROPS = {
  "philly-cheesesteak": [18, 48, 1500, 1875],
  "spinach-salad": [100, 121, 1400, 1750],
  "bacon-burger": [16, 170, 728, 910], // tight under the sink pipes along the top
  "crab-pretzel": [55, 0, 1700, 2125],
  "beer-cheese-pretzel-board": [640, 232, 1360, 1700],
  "guys-burger": [140, 440, 1000, 1250], // tight on the burger, away from the diners and the sleeve
  "beet-salad": [330, 90, 1360, 1700], // the stack, walnuts and plate edge; the steel counter stays out
};
export const WIDTHS = [480, 960, 1280]; // 1280 × 1600 is the largest (1600 px long side)

const only = process.argv.slice(2);
for (const [name, [left, top, width, height]] of Object.entries(CROPS)) {
  if (only.length && !only.includes(name)) continue;
  const src = [".jpg", ".webp", ".png"].map((ext) => `assets/food/${name}${ext}`).find(existsSync);
  const base = sharp(src)
    .rotate()
    .extract({ left, top, width, height })
    .recomb([
      [1.04, 0, 0],
      [0, 1.0, 0],
      [0, 0, 0.94],
    ])
    .modulate({ brightness: 1.03, saturation: 1.05 });
  const master = await base.toBuffer();
  // never upscale: a small original stops at its own width (bacon burger: 480 and 728)
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, width)))];
  for (const w of widths) {
    const out = `public/img/food/${name}-${w}`;
    const img = () => sharp(master).resize({ width: w, height: Math.round((w * 5) / 4) });
    await img().webp({ quality: 74 }).toFile(`${out}.webp`);
    await img().avif({ quality: 50 }).toFile(`${out}.avif`);
    const m = await sharp(`${out}.webp`).metadata();
    console.log(out, `${m.width}x${m.height}`, Math.round(statSync(`${out}.webp`).size / 1024) + "KB webp", Math.round(statSync(`${out}.avif`).size / 1024) + "KB avif");
  }
}
