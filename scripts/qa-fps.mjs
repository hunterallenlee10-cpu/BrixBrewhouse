// Frame pacing while scrubbing the hero (desktop). node scripts/qa-fps.mjs [cpuRate]
import { chromium } from "@playwright/test";
const rate = Number(process.argv[2] ?? 1);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("brix-21", "yes"));
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
if (process.env.NOGRAIN) await p.addStyleTag({ content: ".grain{display:none!important}" });
await p.waitForTimeout(6000); // let frames load
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
const r = await p.evaluate(async () => {
  const H = document.getElementById("top").offsetHeight - innerHeight;
  const deltas = [];
  let last = performance.now();
  let run = true;
  const tick = (t) => { deltas.push(t - last); last = t; if (run) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const start = performance.now();
  await new Promise((res) => {
    const step = () => {
      const k = (performance.now() - start) / 5000; // 5 s from top to the pint
      window.scrollTo(0, Math.min(1, k) * H);
      if (k < 1) requestAnimationFrame(step); else setTimeout(res, 600);
    };
    step();
  });
  run = false;
  deltas.shift();
  const s = [...deltas].sort((a, b) => a - b);
  const pct = (q) => s[Math.floor(q * (s.length - 1))];
  return { frames: deltas.length, avgFps: 1000 / (deltas.reduce((a, b) => a + b, 0) / deltas.length), p50: pct(0.5), p95: pct(0.95), over20: deltas.filter((d) => d > 20).length };
});
console.log(`cpu x${rate}`, JSON.stringify(r));
await b.close();
