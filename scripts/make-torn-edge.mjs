// A repeatable torn-paper bottom edge (600x16 tile) for the press clippings' mask.
// Deterministic: small seeded random walk + fibre spikes, so the tear looks hand-ripped.
import { writeFileSync } from "node:fs";
let seed = 1953;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const W = 600, H = 16;
const pts = [];
let y = 8;
for (let x = 0; x <= W; x += 1.5 + rnd() * 3) {
  y += (rnd() - 0.5) * 3.2;
  y = Math.max(3, Math.min(12, y));
  const fibre = rnd() < 0.08 ? 2 + rnd() * 2.5 : 0; // occasional fibre poking past the tear
  pts.push([x, y + fibre]);
}
// make the tile wrap: last point lands on the first point's height
pts.push([W, pts[0][1]]);
const d = `M0 0H${W}V${pts.at(-1)[1].toFixed(1)}` + pts.slice().reverse().map(([x, yy]) => `L${x.toFixed(1)} ${yy.toFixed(1)}`).join("") + "Z";
writeFileSync("public/tex/torn-edge.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><path d="${d}"/></svg>\n`);
console.log("torn-edge.svg", pts.length, "points");
