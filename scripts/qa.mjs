// Brix QA pass (brief section 8). Usage: node scripts/qa.mjs <outdir> [baseUrl]
// Requires a running production server (npx next start).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "qa-shots";
const base = process.argv[3] ?? "http://localhost:3000/";
mkdirSync(out, { recursive: true });
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: exe });
const report = [];
const errors = [];
const ok = (name, pass, note = "") => report.push(`${pass ? "PASS" : "FAIL"}  ${name}${note ? `  (${note})` : ""}`);

const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

async function newPage(kind, { skipGate = true, reduced = false } = {}) {
  const ctx = await browser.newContext({ ...VIEWS[kind], reducedMotion: reduced ? "reduce" : "no-preference" });
  if (skipGate) await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${kind}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${kind}: ${e.message}`));
  return { ctx, page };
}

const scrollToSel = async (page, sel, extra = 0) => {
  await page.evaluate(
    ([s, e]) => {
      const el = document.querySelector(s);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + e);
    },
    [sel, extra],
  );
  await page.waitForTimeout(1200);
};

// 1. gate -> yes -> hero 0/30/60/95
for (const kind of ["desktop", "mobile"]) {
  const { ctx, page } = await newPage(kind, { skipGate: false });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${kind}-00-gate.png` });
  ok(`${kind} gate shows`, await page.getByRole("dialog", { name: /21 or older/i }).isVisible());
  const logoBox = await page.locator(".age-gate svg[aria-label='Brix Brewhouse']").boundingBox();
  ok(`${kind} gate logo renders (${logoBox ? Math.round(logoBox.width) + "x" + Math.round(logoBox.height) : "missing"})`, !!logoBox && logoBox.width > 80 && logoBox.height > 80);
  await page.getByRole("button", { name: "Yes, open the door" }).click();
  await page.waitForTimeout(3600);
  const heroH = await page.evaluate(() => document.getElementById("top").offsetHeight - innerHeight);
  for (const p of [0, 0.3, 0.6, 0.95]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(heroH * p));
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}/${kind}-01-hero-${String(Math.round(p * 100)).padStart(2, "0")}.png` });
  }
  ok(`${kind} gate remembered`, (await page.evaluate(() => sessionStorage.getItem("brix-21"))) === "yes");
  await ctx.close();
}

// 2. every section, full scroll, both viewports
const SECTIONS = ["#brix", "#on-tap", "#bar-top", "#kitchen", "#lounge", "#dispatch", "#press", "#visit", "#faq", "footer"];
for (const kind of ["desktop", "mobile"]) {
  const { ctx, page } = await newPage(kind);
  await page.goto(base, { waitUntil: "networkidle" });
  for (const s of SECTIONS) {
    const exists = (await page.locator(s).count()) > 0;
    ok(`${kind} section ${s} present`, exists);
    if (!exists) continue;
    await scrollToSel(page, s);
    await page.screenshot({ path: `${out}/${kind}-02-${s.replace("#", "")}.png` });
  }
  await ctx.close();
}

// 2b. flight builder (desktop + touch) and bar-top caps
for (const kind of ["desktop", "mobile"]) {
  const { ctx, page } = await newPage(kind);
  await page.goto(base, { waitUntil: "networkidle" });
  await scrollToSel(page, "#on-tap", 200);
  const taps = page.locator('.flt-rail button[aria-label^="Pour "]');
  const n = await taps.count();
  for (let i = 0; i < 4; i++) {
    const t = taps.nth(i);
    await t.scrollIntoViewIfNeeded();
    if (kind === "mobile") await t.tap();
    else await t.click();
    await page.waitForTimeout(1300);
  }
  const card = page.locator("#flight-card-title");
  ok(`${kind} full flight of 4 poured (${n} taps)`, (await card.count()) > 0);
  if (await card.count()) await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${kind}-06-flight-full.png` });

  await scrollToSel(page, "#bar-top", 300);
  const caps = page.locator("#bar-top button[aria-pressed]");
  let flipped = 0;
  for (let i = 0; i < 3; i++) {
    const c = caps.nth(i);
    await c.scrollIntoViewIfNeeded();
    if (kind === "mobile") await c.tap();
    else await c.click();
    await page.waitForTimeout(700);
    if ((await c.getAttribute("aria-pressed")) === "true") flipped++;
  }
  ok(`${kind} flipped 3 caps`, flipped === 3, `${flipped}/3`);
  await page.screenshot({ path: `${out}/${kind}-07-caps-flipped.png` });
  await ctx.close();
}

// 3. modal tabs
for (const kind of ["desktop", "mobile"]) {
  const { ctx, page } = await newPage(kind);
  await page.goto(base, { waitUntil: "networkidle" });
  const heroH = await page.evaluate(() => document.getElementById("top").offsetHeight - innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), heroH);
  await page.waitForTimeout(1500);
  await page.locator("#top").getByRole("button", { name: "Pour One With Us" }).click();
  await page.waitForTimeout(900);
  for (const tab of ["Visit", "Large group", "Private event"]) {
    await page.getByRole("tab", { name: tab }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${kind}-03-modal-${tab.replace(" ", "-").toLowerCase()}.png` });
    ok(`${kind} modal tab ${tab}`, (await page.getByRole("tab", { name: tab }).getAttribute("aria-selected")) === "true");
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  ok(`${kind} modal closes on Esc`, (await page.locator('[role="dialog"]').count()) === 0);
  await ctx.close();
}

// 4. status pill under mocked clocks (America/New_York)
const CLOCKS = [
  ["tue-1pm", "2026-10-20T13:00:00-04:00", /Open now.*until 9 PM/i],
  ["fri-1030pm", "2026-10-23T22:30:00-04:00", /Open now.*until 11 PM/i],
  ["sun-930pm", "2026-10-25T21:30:00-04:00", /Closed.*tomorrow 12 PM/i],
];
for (const [name, iso, expect] of CLOCKS) {
  const { ctx, page } = await newPage("desktop");
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(base, { waitUntil: "networkidle" });
  const pill = page.locator('[role="status"]').first();
  await page.waitForTimeout(400);
  const text = (await pill.textContent()) ?? "";
  ok(`status pill ${name}`, expect.test(text.replace(/\s+/g, " ")), text.trim());
  if ((await page.locator("#visit").count()) > 0) {
    await scrollToSel(page, "#visit");
    await page.screenshot({ path: `${out}/desktop-04-status-${name}.png` });
  }
  await ctx.close();
}

// 5. no horizontal scroll at the brief's widths
for (const w of [360, 390, 768, 1024, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`no horizontal scroll at ${w}px`, overflow <= 0, `overflow ${overflow}px`);
  await ctx.close();
}

// 5b. the hungry-phone test: Menu button lands on the menu
{
  const { ctx, page } = await newPage("mobile");
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const t0 = Date.now();
  await page.getByRole("navigation", { name: "Quick actions" }).getByRole("link", { name: "Menu" }).tap();
  await page.waitForTimeout(3200);
  const top = await page.evaluate(() => document.getElementById("menu")?.getBoundingClientRect().top ?? 9999);
  ok("mobile Menu button lands on the menu", Math.abs(top - 72) < 40, `menu top ${Math.round(top)}px after ${Date.now() - t0}ms`);
  await page.screenshot({ path: `${out}/mobile-08-menu-jump.png` });
  await ctx.close();
}

// 6. reduced motion renders static states
{
  const { ctx, page } = await newPage("desktop", { reduced: true });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/desktop-05-reduced-hero.png` });
  ok("reduced-motion hero is static (no tall scrub track)", (await page.evaluate(() => document.getElementById("top").offsetHeight)) <= 1200);
  await ctx.close();
}

await browser.close();
console.log(report.join("\n"));
console.log(errors.length ? `\nCONSOLE ERRORS (${errors.length}):\n${[...new Set(errors)].join("\n")}` : "\nzero console errors");
