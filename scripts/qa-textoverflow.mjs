// Elements whose text overflows their own box. node scripts/qa-textoverflow.mjs
import { chromium } from "@playwright/test";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll("#main > section, body > footer").forEach((s) => (s.style.contentVisibility = "visible")));
  const r = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("p, span, a, button, h1, h2, h3, h4, td, th, li")) {
      const cs = getComputedStyle(el);
      if (cs.display === "inline" || el.offsetParent === null || el.classList.contains("sr-only") || el.closest(".bt-slot, h1")) continue;
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== "auto" && cs.overflowX !== "scroll") out.push(`${el.scrollWidth - el.clientWidth}px ${el.tagName}.${String(el.className).slice(0, 60)} "${el.textContent.trim().slice(0, 40)}"`);
    }
    return out.slice(0, 12);
  });
  console.log(vp.width, "\n " + r.join("\n "));
  await ctx.close();
}
await b.close();
