// Compose public/og-image.png (1200x630) in code: H4 pint + traced logo + set type.
// The card is laid out as HTML with the bundled OFL fonts and captured by headless Chromium,
// which sets Big Shoulders exactly the way the site does. Run: node scripts/make-og.mjs
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const W = 1200, H = 630;
const dataUri = (p, type) => `data:${type};base64,${readFileSync(resolve(p)).toString("base64")}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "BS"; src: url(${dataUri("scripts/fonts/BigShoulders-ExtraBold.ttf", "font/ttf")}); font-weight: 800; }
@font-face { font-family: "JBM"; src: url(${dataUri("scripts/fonts/JetBrainsMono-Medium.ttf", "font/ttf")}); font-weight: 500; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; background: #0b0c0d; overflow: hidden; position: relative; }
.photo { position: absolute; right: -360px; top: -36px; width: 1400px; }
.shade { position: absolute; inset: 0;
  background: linear-gradient(90deg, #0b0c0d 0%, rgb(11 12 13 / .92) 40%, rgb(11 12 13 / .12) 70%, transparent 100%),
              linear-gradient(180deg, transparent 60%, rgb(11 12 13 / .85) 100%); }
.logo { position: absolute; left: 58px; top: 40px; height: 168px; }
h1 { position: absolute; left: 62px; top: 222px; font: 800 132px/0.84 "BS"; letter-spacing: -0.5px; color: #f2f2f2; text-transform: uppercase; }
h1 span { color: #f0bf45; }
.line { position: absolute; left: 66px; bottom: 44px; font: 500 17px "JBM"; letter-spacing: 2.6px; color: #c9c3b9; }
.tag { position: absolute; right: 24px; bottom: 20px; font: 500 11px "JBM"; letter-spacing: 2px; color: rgb(242 242 242 / .6); }
.rule { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: #ea0322; }
</style></head><body>
<img class="photo" src="${dataUri("public/img/pint-h4.webp", "image/webp")}">
<div class="shade"></div>
<img class="logo" src="${dataUri("public/brand/brix-logo-white.svg", "image/svg+xml")}">
<h1>The firehouse<br>is pouring<br><span>again</span></h1>
<p class="line">BRIX BREWHOUSE · BRODHEADSVILLE, PA · ROUTE 715</p>
<p class="tag">ILLUSTRATIVE RENDER</p>
<div class="rule"></div>
</body></html>`;

const exe = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium/chrome-linux/chrome"].find(existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-image.png", type: "png" });
await browser.close();
console.log(`public/og-image.png ${W}x${H}`);
