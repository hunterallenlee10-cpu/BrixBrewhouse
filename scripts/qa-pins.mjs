// Screens inside the pinned Three Meanings section + the real page footer.
import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [kind, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: kind === "mobile", hasTouch: kind === "mobile" });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const { top, h } = await p.evaluate(() => {
    const el = document.getElementById("brix");
    const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
    return { top: spacer.getBoundingClientRect().top + scrollY, h: spacer.offsetHeight };
  });
  for (const f of [0.15, 0.35, 0.55, 0.75, 0.95]) {
    await p.evaluate((y) => scrollTo(0, y), Math.round(top + (h - vp.height) * f));
    await p.waitForTimeout(1400);
    await p.screenshot({ path: `${out}/${kind}-brix-${Math.round(f * 100)}.png` });
  }
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/${kind}-page-bottom.png` });
  await ctx.close();
}
await b.close();
