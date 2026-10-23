// Screenshot one selector at mobile + desktop. node scripts/qa-shot.mjs <selector> <outprefix> [offsetPx]
import { chromium } from "@playwright/test";
const [sel, outp, off = "0"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [k, vp] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: k === "m", hasTouch: k === "m", deviceScaleFactor: k === "m" ? 2 : 1 });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.evaluate(([s, o]) => { const el = document.querySelector(s); el && el.scrollIntoView({ block: "start" }); scrollBy(0, Number(o)); }, [sel, off]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${outp}-${k}.png` });
  await ctx.close();
}
await b.close();
