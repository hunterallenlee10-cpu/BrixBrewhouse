import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The traced logo badge, inlined into the HTML at build time so the gate's
 * hero mark paints with the document (no extra request on the critical path).
 */
const RAW = readFileSync(path.join(process.cwd(), "public/brand/brix-logo.svg"), "utf8")
  .replace(/<title[^>]*>.*?<\/title>/, "")
  .replace(/ role="img"| aria-labelledby="t"/g, "");

export function LogoBadge({ className = "" }: { className?: string }) {
  const svg = RAW.replace("<svg ", `<svg class="block h-full w-full" role="img" aria-label="Brix Brewhouse" `);
  // the box needs its own aspect ratio: inside a shrink-to-fit flex column a bare
  // h-full SVG resolves to 0x0 and the badge silently disappears
  return <span className={`block h-full aspect-[1290/1260] ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
