// Break long main-thread tasks down by event type. node scripts/qa-trace.mjs [skip]
import { chromium } from "@playwright/test";
const skip = process.argv[2] === "skip";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
if (skip) await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"] });
await p.goto(process.env.URL ?? "http://localhost:3000/", { waitUntil: "load" });
await p.waitForTimeout(7000);
const buf = await b.stopTracing();
const ev = JSON.parse(buf.toString()).traceEvents;
const main = ev.filter((e) => e.name === "RunTask" && e.dur > 50000);
console.log("long tasks:", main.length);
const kids = ev.filter((e) => e.ph === "X" && e.dur > 2000 && e.name !== "RunTask");
for (const t of main.slice(0, 14)) {
  const inner = kids.filter((k) => k.tid === t.tid && k.ts >= t.ts && k.ts + k.dur <= t.ts + t.dur);
  const agg = {};
  for (const k of inner) agg[k.name] = (agg[k.name] ?? 0) + k.dur / 1000;
  const fn = inner.find((k) => k.name === "FunctionCall")?.args?.data;
  const top = Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n, d]) => `${n}:${d.toFixed(0)}`).join(" ");
  console.log(`${(t.dur / 1000).toFixed(0)}ms  ${top}  ${fn ? `${fn.functionName}@${(fn.url || "").split("/").pop()}:${fn.lineNumber}` : ""}`);
}
await b.close();
