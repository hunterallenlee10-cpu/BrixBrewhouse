import { chromium } from "@playwright/test";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 768, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await ctx.newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const W = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll("body *")) {
    const rc = el.getBoundingClientRect();
    if (rc.right > W + 1 && rc.right < W + 80) out.push(`${Math.round(rc.right)} ${el.tagName}.${String(el.className).slice(0, 80)} pos=${getComputedStyle(el).position}`);
  }
  return out.slice(0, 15).join("\n");
}));
await b.close();
