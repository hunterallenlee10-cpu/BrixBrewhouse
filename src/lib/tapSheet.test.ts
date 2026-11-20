import { describe, expect, it } from "vitest";
import { beersFromRows, featuredBeer, parseAbv, parseCsv, sheetCsvUrl } from "./tapSheet";

// The Tap List tab as Google's CSV export gives it (headers=0: every row, every cell quoted).
const CSV = [
  `"BRIX BREWHOUSE  |  LIVE TAP LIST","","","","","",""`,
  `"Select a beer and set On Tap to Yes. Only LIVE rows belong on the website.","","","","","",""`,
  `"","","","","","",""`,
  `"Tap #","Beer","On Tap?","Style","ABV","Short Website Description","Website Status"`,
  `"1","Cranberry Orange Cream Ale","Yes","Fruit Cream Ale","","Cream ale with bright orange and tart cranberry.","LIVE"`,
  `"2","Brix Brown Ale","Yes","American Brown Ale","6.2%","Toasty malt with caramel and a touch of chocolate.","LIVE"`,
  `"3","Murphy Pale Ale","Yes","Pale Ale","5.3%","Pale ale with balanced bitterness, and a clean finish.","LIVE"`,
  `"7","Murphy Porter","Yes","Porter","7.1%","Rich dark malt with chocolate and roasted notes.","LIVE"`,
  `"6","Brix Goulden Cider","Yes","Hard Cider","0.072","Refreshing apple cider with a clean, dry finish.","LIVE"`,
  `"","","","","","",""`,
  `"9","","No","","","","HIDDEN"`,
  `"10","Old Seasonal","No","Lager","5%","Gone for now.","HIDDEN"`,
].join("\r\n");

describe("tap sheet", () => {
  const beers = beersFromRows(parseCsv(CSV));

  it("keeps only LIVE rows, in tap order", () => {
    expect(beers.map((b) => b.name)).toEqual(["Cranberry Orange Cream Ale", "Brix Brown Ale", "Murphy Pale Ale", "Brix Goulden Cider", "Murphy Porter"]);
    expect(beers.map((b) => b.tap)).toEqual([1, 2, 3, 6, 7]);
  });

  it("reads quoted commas, ABV and blanks", () => {
    const pale = beers.find((b) => b.name === "Murphy Pale Ale")!;
    expect(pale.description).toBe("Pale ale with balanced bitterness, and a clean finish.");
    expect(pale.abv).toBe(5.3);
    expect(beers[0].abv).toBeNull();
    expect(beers.find((b) => b.name === "Brix Goulden Cider")!.abv).toBe(7.2);
  });

  it("gives every beer a glass colour and a url-safe id", () => {
    for (const b of beers) {
      expect(b.liquid).toMatch(/^#[0-9A-F]{6}$/i);
      expect(b.id).toMatch(/^[a-z0-9-]+$/);
    }
    expect(beers.find((b) => b.name === "Murphy Porter")!.liquid).toBe("#2A120A");
  });

  it("falls back to On Tap? when there's no status column", () => {
    const rows = [["Tap #", "Beer", "On Tap?"], ["1", "A Lager", "Yes"], ["2", "B Ale", "No"]];
    expect(beersFromRows(rows).map((b) => b.name)).toEqual(["A Lager"]);
  });

  it("returns nothing for a page that isn't the tap list", () => {
    expect(beersFromRows(parseCsv("<html>Sign in</html>"))).toEqual([]);
  });

  it("helpers", () => {
    const gviz = "https://docs.google.com/spreadsheets/d/1AbC_def-123456789012345/gviz/tq?tqx=out:csv&headers=1&range=A4:Z&sheet=Tap%20List";
    expect(sheetCsvUrl("https://docs.google.com/spreadsheets/d/1AbC_def-123456789012345/edit#gid=0")).toBe(gviz);
    expect(sheetCsvUrl("1AbC_def-123456789012345")).toBe(gviz);
    const pub = "https://docs.google.com/spreadsheets/d/e/2PACX-abc/pub?gid=0&single=true&output=csv";
    expect(sheetCsvUrl(pub)).toBe(pub);
    expect(sheetCsvUrl("")).toBeNull();
    expect(sheetCsvUrl("nope")).toBeNull();
    expect(parseAbv("4.5%")).toBe(4.5);
    expect(parseAbv("n/a")).toBeNull();
  });

  it("reads IBU, Color and Featured?, and a blank cell stays blank", () => {
    const rows = [
      ["Tap #", "Beer", "On Tap?", "Style", "ABV", "Short Website Description", "Website Status", "IBU", "Color", "Featured?"],
      ["1", "Brown Ale", "Yes", "Brown Ale", "", "Malty.", "LIVE", "", "", "No"],
      ["2", "Murphy Porter", "Yes", "Porter", "7.1%", "Roasty.", "LIVE", "32", "Jet Black", "Yes"],
    ];
    const [brown, porter] = beersFromRows(rows);
    // "Brown Ale" matches data/taps.json, but the sheet's own blank cells win
    expect([brown.abv, brown.ibu, brown.color]).toEqual([null, null, null]);
    expect([porter.ibu, porter.color, porter.featured]).toEqual([32, "Jet Black", true]);
    expect(featuredBeer([brown, porter]).name).toBe("Murphy Porter");
    expect(featuredBeer([{ ...porter, featured: false, tap: 5 }, brown]).name).toBe("Brown Ale"); // none marked: lowest tap
  });
});
