// Quick visual check: node scripts/shoot.mjs <outdir> [url]
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
const out = process.argv[2] ?? "shots";
const url = process.argv[3] ?? "http://localhost:3000/";
const exe = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium/chrome-linux/chrome"].find(existsSync);
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
for (const vp of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor ?? 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp.name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${vp.name}-gate.png` });
  await page.getByRole("button", { name: "Yes, open the door" }).click();
  await page.waitForTimeout(3600);
  await page.screenshot({ path: `${out}/${vp.name}-hero-15.png` });
  const heroH = await page.evaluate(() => document.getElementById("top").offsetHeight - innerHeight);
  for (const p of [0.3, 0.6, 0.95]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(heroH * p));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${vp.name}-hero-${Math.round(p * 100)}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console errors");
