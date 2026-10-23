// CPU profile of the first N seconds (gate up, 4x CPU). node scripts/qa-profile.mjs [ms] [skipGate]
import { chromium } from "@playwright/test";
const ms = Number(process.argv[2] ?? 6000);
const skip = process.argv[3] === "skip";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
if (skip) await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
await cdp.send("Profiler.start");
await p.goto((process.env.URL ?? "http://localhost:3000/"), { waitUntil: "load" });
await p.waitForTimeout(ms);
const { profile } = await cdp.send("Profiler.stop");
const self = new Map();
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => {
  const n = byId.get(id);
  const key = `${n.callFrame.functionName || "(anon)"} @${(n.callFrame.url || "").split("/").pop()}:${n.callFrame.lineNumber}`;
  self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0) / 1000);
});
console.log([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${v.toFixed(0).padStart(6)}ms ${k}`).join("\n"));
await b.close();
