// QA for Phase 5 sections: node scripts/qa-phase5.mjs <outdir> [baseUrl]
import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "shots";
const url = process.argv[3] ?? "http://localhost:3014/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const errors = [];
const log = (...a) => console.log(...a);

async function open(vp, when) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    deviceScaleFactor: vp.mobile ? 2 : 1,
    timezoneId: "America/New_York",
  });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${vp.name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  if (when) await page.clock.setFixedTime(new Date(when));
  await page.goto(url, { waitUntil: "networkidle" });
  return { ctx, page };
}
const toSection = async (page, sel) => {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel);
  await page.waitForTimeout(900);
};

const VPS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

for (const vp of VPS) {
  const { ctx, page } = await open(vp, "2026-10-20T13:00:00-04:00");
  for (const [sel, name] of [
    ["#press", "press"],
    ["#visit", "visit"],
    ["#faq", "faq"],
    ["section[aria-labelledby=final-title]", "final"],
    ["footer", "footer"],
  ]) {
    await toSection(page, sel);
    await page.locator(sel).first().screenshot({ path: `${out}/${vp.name}-${name}.png` });
  }
  // click-to-load map
  await toSection(page, "#visit");
  const before = await page.locator("#visit iframe").count();
  await page.getByRole("button", { name: "Load Google Map" }).click();
  await page.waitForTimeout(400);
  log(vp.name, "map iframe before/after:", before, await page.locator("#visit iframe").count());
  // click-to-load video
  await toSection(page, "#press");
  const vBefore = await page.locator("#press iframe").count();
  await page.getByRole("button", { name: /Play video/ }).click();
  await page.waitForTimeout(400);
  log(vp.name, "video iframe before/after:", vBefore, await page.locator("#press iframe").count());
  // FAQ by keyboard
  await toSection(page, "#faq");
  const q = page.locator("#faq button[aria-expanded]");
  await q.nth(1).focus();
  await page.keyboard.press("Enter");
  const a = await q.nth(1).getAttribute("aria-expanded");
  await page.keyboard.press("Space");
  const b = await q.nth(1).getAttribute("aria-expanded");
  log(vp.name, "faq q2 enter->", a, "space->", b, "q1 after:", await q.nth(0).getAttribute("aria-expanded"));
  await ctx.close();
}

// status pill + hours table under three clocks
for (const [when, tag] of [
  ["2026-10-20T13:00:00-04:00", "tue-1pm"],
  ["2026-10-23T22:30:00-04:00", "fri-1030pm"],
  ["2026-10-25T21:30:00-04:00", "sun-930pm"],
]) {
  const { ctx, page } = await open(VPS[0], when);
  await toSection(page, "#visit");
  await page.waitForTimeout(300);
  const pill = (await page.locator("#visit [role=status]").first().innerText()).replace(/\s+/g, " ");
  const today = (await page.locator("#visit tr[aria-current=date]").innerText().catch(() => "none")).replace(/\s+/g, " ");
  log(tag, "| pill:", pill, "| today row:", today);
  await page.screenshot({ path: `${out}/clock-${tag}.png` });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? "ERRORS:\n" + [...new Set(errors)].join("\n") : "no console errors");
