// Who forces synchronous layout during load? node scripts/qa-forced-layout.mjs [skip]
import { chromium } from "@playwright/test";
const skip = process.argv[2] === "skip";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
if (skip) await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.stack"] });
await p.goto(process.env.URL ?? "http://localhost:3000/", { waitUntil: "load" });
await p.waitForTimeout(6000);
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
const forced = ev.filter((e) => (e.name === "Layout" || e.name === "UpdateLayoutTree") && e.dur > 8000 && (e.args?.beginData?.stackTrace || e.args?.data?.stackTrace));
const agg = new Map();
for (const e of forced) {
  const st = e.args.beginData?.stackTrace ?? e.args.data?.stackTrace;
  const f = st.slice(0, 3).map((s) => `${s.functionName || "(anon)"}@${(s.url || "").split("/").pop()}:${s.lineNumber}:${s.columnNumber}`).join(" < ");
  agg.set(f, (agg.get(f) ?? 0) + e.dur / 1000);
}
console.log([...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${v.toFixed(0)}ms  ${k}`).join("\n"));
await b.close();
