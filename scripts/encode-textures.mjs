// Encode processed textures to WebP + AVIF under ~300 KB each.
import sharp from "sharp";
import { statSync, mkdirSync } from "node:fs";
mkdirSync("public/img/caps", { recursive: true });
const jobs = [
  { src: "assets/processed/brick.png", out: "public/tex/brick", width: 880 },   // tileable
  { src: "assets/processed/stainless.png", out: "public/tex/stainless", width: 1024 }, // tileable
  { src: "assets/processed/chalk.png", out: "public/tex/chalk", width: 1400 },  // tileable
  { src: "assets/raw/T3_b.png", out: "public/tex/walnut", width: 1600 },        // cover only
  { src: "assets/raw/T5_b.png", out: "public/tex/caps", width: 1800 },          // cover only
  { src: "assets/raw/maple.png", out: "public/tex/maple", width: 1800 },        // cover only (shuffleboard)
  { src: "assets/raw/newsprint.png", out: "public/tex/newsprint", width: 1200 }, // cover only (press clippings)
];
// cut-out caps (scripts/cut-caps.py) keep their alpha; 480px covers a 236px cap at 2x
const caps = ["red", "gold", "silver", "green", "gunmetal", "cream", "liner"].map((c) => ({
  src: `assets/raw/caps/cap-${c}.png`, out: `public/img/caps/cap-${c}`, width: 480, cap: 70,
}));
jobs.push(...caps);
for (const j of jobs) {
  for (const [fmt, opts] of [["webp", { quality: 78 }], ["avif", { quality: 55 }]]) {
    let q = opts.quality, file = `${j.out}.${fmt}`, size = Infinity;
    while (q >= 30) {
      await sharp(j.src).resize({ width: j.width }).toFormat(fmt, { ...opts, quality: q }).toFile(file);
      size = statSync(file).size;
      if (size <= (j.cap ?? 300) * 1024) break;
      q -= 8;
    }
    console.log(file, Math.round(size / 1024) + "KB", "q" + q);
  }
}
