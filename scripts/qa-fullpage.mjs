// Full-page captures at reduced scale (content-visibility forced visible, motion settled).
// node scripts/qa-fullpage.mjs <outdir>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, vp, mobile, dsf] of [["desktop", { width: 1440, height: 900 }, false, 0.5], ["mobile", { width: 390, height: 844 }, true, 1]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: dsf, reducedMotion: "reduce" });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll("#main > section, body > footer").forEach((s) => (s.style.contentVisibility = "visible")));
  // walk the page once so lazy images and reveal observers fire, then return to the top
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  // a full-page shot never scrolls, so lazy images would stay empty: load them all first
  await p.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")];
    imgs.forEach((i) => (i.loading = "eager"));
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true, type: "png" });
  await ctx.close();
}
await b.close();
