import { describe, expect, it } from "vitest";
import { labelTiers } from "./meter";

describe("labelTiers", () => {
  it("keeps far-apart pins on one row", () => {
    expect(labelTiers([0.1, 0.5, 0.9, 0.3])).toEqual([0, 0, 0, 0]);
  });
  it("stacks close or identical pins", () => {
    // 2 and 4 share a value, 1 and 3 are 0.03 apart
    expect(labelTiers([0.1, 0.6, 0.13, 0.6])).toEqual([0, 0, 1, 1]);
  });
  it("ignores beers without stats", () => {
    expect(labelTiers([null, 0.4, 0.42, null])).toEqual([0, 0, 1, 0]);
  });
});
