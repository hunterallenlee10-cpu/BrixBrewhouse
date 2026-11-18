// The live tap list, read from the owners' Google Sheet ("Tap List" tab).
// Rows whose "On Tap?" is Yes (or whose Website Status is LIVE) go on the site, in Tap # order.
// If the sheet isn't set up, can't be reached, or has nothing on tap, the site falls back to /data/taps.json.
import { cacheLife } from "next/cache";
import { TAPS, type Beer } from "./data";

/**
 * Where to read the Tap List as CSV. TAP_SHEET_ID may be the sheet's normal link, its bare id,
 * or a "Publish to web" CSV link (used as is).
 */
export function sheetCsvUrl(input: string | undefined, tab = "Tap List"): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/^https?:\/\//.test(s) && (s.includes("/d/e/") || s.includes("output=csv") || !s.includes("/spreadsheets/d/"))) return s;
  const id = s.match(/\/spreadsheets\/d\/([\w-]+)/)?.[1] ?? (/^[\w-]{20,}$/.test(s) ? s : null);
  if (!id) return null;
  // headers=0 keeps Google from merging the title rows into a header; the parser finds the real one
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(tab)}`;
}

/** Minimal RFC 4180 CSV parser: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s: string) => norm(s).replace(/ /g, "-");

/** "6.2%", "6.2", "0.062" → 6.2. Blank or unreadable → null. */
export function parseAbv(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  const pct = !v.includes("%") && n > 0 && n < 0.2 ? n * 100 : n; // a raw fraction from the sheet
  return Math.round(pct * 10) / 10;
}

/** A glass colour and haze for a style the site has never seen, from words in its name and style. */
export function lookFor(text: string): Pick<Beer, "liquid" | "haze"> & { foam?: string } {
  const t = norm(text);
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (has("stout", "porter", "schwarz")) return { liquid: "#2A120A", haze: 0, foam: "#D9C3A5" };
  if (has("birch", "root beer")) return { liquid: "#3A140C", haze: 0, foam: "#E9D6C2" };
  if (has("brown", "dunkel", "bock")) return { liquid: "#4A2412", haze: 0 };
  if (has("red", "amber", "marzen", "oktoberfest", "irish")) return { liquid: "#A8521E", haze: 0 };
  if (has("pumpkin")) return { liquid: "#C46A1C", haze: 0.1 };
  if (has("cranberry", "cherry", "raspberry", "berry", "sour")) return { liquid: "#D9774A", haze: 0.2 };
  if (has("cider", "seltzer", "mead")) return { liquid: "#F0D27A", haze: 0.05 };
  if (has("hazy", "neipa", "new england", "juicy")) return { liquid: "#E6B04A", haze: 0.9 };
  if (has("wheat", "wit", "white", "hefe")) return { liquid: "#EBCB7A", haze: 0.8 };
  if (has("pilsner", "lager", "kolsch", "blonde", "cream", "light")) return { liquid: "#E9C45B", haze: 0 };
  if (has("ipa", "pale")) return { liquid: "#D9A033", haze: 0.1 };
  return { liquid: "#D69E14", haze: 0 };
}

/**
 * Turn the Tap List tab (as CSV rows) into beers. Finds the header row by its "Beer" and "On Tap?"
 * cells, so the title rows above it and any column reordering don't matter.
 * Stats the sheet doesn't carry (IBU, colour name) come from /data/taps.json when the names match.
 */
export function beersFromRows(rows: string[][], library: Beer[] = TAPS.beers): Beer[] {
  const h = rows.findIndex((r) => r.some((c) => norm(c) === "beer") && r.some((c) => norm(c).startsWith("on tap")));
  if (h === -1) return [];
  const head = rows[h].map(norm);
  const col = (...names: string[]) => head.findIndex((c) => names.some((n) => c === n || c.startsWith(n)));
  const at = {
    tap: col("tap", "tap #"),
    beer: col("beer"),
    onTap: col("on tap"),
    style: col("style"),
    abv: col("abv"),
    desc: col("short website description", "description"),
    status: col("website status", "status"),
  };
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const byName = new Map(library.flatMap((b) => [[norm(b.name), b] as const, [norm(b.short), b] as const]));
  const seen = new Set<string>();

  const live = rows.slice(h + 1).filter((r) => {
    const name = cell(r, at.beer);
    if (!name) return false;
    const status = norm(cell(r, at.status));
    if (status) return status === "live";
    return norm(cell(r, at.onTap)) === "yes";
  });

  return live
    .map((r, i): Beer => {
      const name = cell(r, at.beer);
      const style = cell(r, at.style);
      const known = byName.get(norm(name));
      let id = known?.id ?? slug(name);
      while (seen.has(id)) id += "-2";
      seen.add(id);
      const tapNo = parseInt(cell(r, at.tap), 10);
      const abv = parseAbv(cell(r, at.abv));
      const description = cell(r, at.desc) || known?.description || (style ? `${style}. Ask your bartender for more.` : "Ask your bartender for more.");
      const look = known ? { liquid: known.liquid, haze: known.haze, foam: known.foam } : lookFor(`${name} ${style}`);
      return {
        id,
        tap: Number.isFinite(tapNo) ? tapNo : i + 1,
        name,
        short: known?.short ?? name,
        style: style || known?.style || "",
        abv: abv ?? known?.abv ?? null,
        ibu: known?.ibu ?? null,
        color: known?.color ?? null,
        ...look,
        kind: known?.kind ?? "house",
        confirmed: true,
        description,
      };
    })
    .sort((a, b) => (a.tap ?? 0) - (b.tap ?? 0));
}

/**
 * What's pouring right now. Cached and re-read from the sheet in the background about once a minute,
 * so a change on the sheet shows on the site within a couple of minutes, without a redeploy.
 */
export async function getLiveBeers(): Promise<{ beers: Beer[]; source: "sheet" | "file" }> {
  "use cache";
  cacheLife("minutes");

  const url = sheetCsvUrl(process.env.TAP_SHEET_ID, process.env.TAP_SHEET_TAB || "Tap List");
  if (!url) return { beers: TAPS.beers, source: "file" };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const type = res.headers.get("content-type") ?? "";
    // a sheet that isn't shared answers with Google's sign-in page, not CSV
    if (!res.ok || type.includes("text/html")) throw new Error(`tap sheet answered ${res.status} ${type}`);
    const beers = beersFromRows(parseCsv(await res.text()));
    if (!beers.length) throw new Error("tap sheet has no beers set to Yes / LIVE");
    return { beers, source: "sheet" };
  } catch (err) {
    console.error("[taps] falling back to data/taps.json:", err);
    return { beers: TAPS.beers, source: "file" };
  }
}
