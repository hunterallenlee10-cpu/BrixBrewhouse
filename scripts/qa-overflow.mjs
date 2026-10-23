// Find what makes the page wider than the viewport. node scripts/qa-overflow.mjs [width...]
import { chromium } from "@playwright/test";
const widths = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const w of widths.length ? widths : [360, 390, 768, 1024, 1440, 1920]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const rc = el.getBoundingClientRect();
      if (rc.right > W + 1) out.push([Math.round(rc.right), `${el.tagName}#${el.id}.${String(el.className).slice(0, 70)}`]);
    }
    out.sort((a, b) => b[0] - a[0]);
    return { sw: document.documentElement.scrollWidth, W, out: out.slice(0, 6) };
  });
  console.log(w, r.sw, r.W, JSON.stringify(r.out));
  await ctx.close();
}
await b.close();
