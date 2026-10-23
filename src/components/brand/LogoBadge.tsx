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
  const svg = RAW.replace("<svg ", `<svg class="h-full w-auto" role="img" aria-label="Brix Brewhouse" `);
  return <span className={`inline-block ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
