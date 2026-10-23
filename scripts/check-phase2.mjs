// Phase 2 QA: node scripts/check-phase2.mjs <outdir> [baseUrl]
// Brick-built BRIX through its pinned timeline, a full flight on desktop + touch, share round-trip.
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";

const out = process.argv[2] ?? "shots-p2";
const base = process.argv[3] ?? "http://localhost:3011/";
mkdirSync(out, { recursive: true });
const exe = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium/chrome-linux/chrome"].find(existsSync);
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const fail = [];
const ok = (cond, msg) => (cond ? console.log("ok  ", msg) : (fail.push(msg), console.log("FAIL", msg)));

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
const FLIGHT = ["pilsner-lager", "american-wheat", "session-ipa", "brown-ale"];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: vp.deviceScaleFactor ?? 1,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp.name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });

  // BAY 01: step through the pinned timeline
  const top = await page.evaluate(() => document.getElementById("brix").getBoundingClientRect().top + scrollY);
  const steps = [0.05, 0.55, 1.0, 1.5, 2.15, 2.75, 3.3];
  for (const k of steps) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + k * vp.height));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${vp.name}-brix-${String(k).replace(".", "_")}.png` });
  }
  // founders line
  await page.locator("#brix blockquote").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${vp.name}-founders.png` });

  // BAY 02: build a full flight
  await page.evaluate(() => document.getElementById("on-tap").scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${vp.name}-ontap.png` });
  for (const id of FLIGHT) {
    const h = page.locator(`[data-beer="${id}"]`).first();
    if (vp.hasTouch) await h.tap();
    else await h.click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);
  const status = await page.locator('#on-tap [role="status"]').first().textContent();
  ok(/4 of 4/.test(status ?? ""), `${vp.name}: live region says 4 of 4 (${status})`);
  await page.locator("#on-tap ol").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/${vp.name}-paddle-full.png` });
  const card = page.locator("#flight-card-title");
  ok(await card.isVisible(), `${vp.name}: Your Flight card visible`);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${vp.name}-flight-card.png` });

  // a fifth pour is refused politely
  await page.locator(`[data-beer="amber-ale"]`).first().click({ force: true });
  const full = await page.locator('#on-tap [role="status"]').first().textContent();
  ok(/full/i.test(full ?? ""), `${vp.name}: fifth pour refused (${full})`);

  // share round-trip
  await page.getByRole("button", { name: "Share my flight" }).click();
  await page.waitForTimeout(300);
  const url = page.url();
  ok(url.includes(`#flight=${FLIGHT.join(",")}`), `${vp.name}: share URL ${url}`);
  const page2 = await ctx.newPage();
  page2.on("pageerror", (e) => errors.push(`${vp.name} reopen: ${e.message}`));
  await page2.goto(url, { waitUntil: "networkidle" });
  await page2.waitForTimeout(800);
  const labels = await page2.locator('#on-tap ol[aria-label="Your flight, four glasses"] li p').allTextContents();
  ok(labels.join("|").includes("SESSION IPA") && labels.join("|").includes("BROWN ALE"), `${vp.name}: reopened flight ${labels.join(" / ")}`);
  await page2.evaluate(() => document.getElementById("on-tap").scrollIntoView());
  await page2.waitForTimeout(900);
  await page2.screenshot({ path: `${out}/${vp.name}-reopened.png` });

  // remove one glass, then birch toggle + pour
  await page2.getByRole("button", { name: /Remove Session IPA/ }).click();
  await page2.getByRole("switch", { name: /Birch Beer/ }).click();
  const birch = page2.locator('[data-beer="birch-beer"]').first();
  if (vp.hasTouch) await birch.tap();
  else await birch.click();
  await page2.waitForTimeout(2800);
  await page2.locator("#on-tap ol").first().scrollIntoViewIfNeeded();
  await page2.screenshot({ path: `${out}/${vp.name}-birch.png` });
  await ctx.close();
}

// reduced motion: static layout, no pin
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await rm.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await rm.newPage();
p.on("pageerror", (e) => errors.push(`reduced: ${e.message}`));
await p.goto(base, { waitUntil: "networkidle" });
await p.evaluate(() => document.getElementById("brix").scrollIntoView());
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/reduced-brix.png`, fullPage: false });
await p.locator('[data-beer="amber-ale"]').first().click();
await p.waitForTimeout(300);
await p.locator("#on-tap ol").first().scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/reduced-paddle.png` });
await rm.close();

await browser.close();
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
console.log(fail.length ? `FAILED: ${fail.length}` : "all checks passed");
process.exit(fail.length || errors.length ? 1 : 0);
