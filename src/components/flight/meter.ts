// Pure helpers for the lightest-to-richest meter (unit-tested).

/** Tier per pin: the lowest row whose last label is at least `gap` (0-1) away. */
export function labelTiers(rs: (number | null)[], gap = 0.07): number[] {
  const tiers = rs.map(() => 0);
  const lastInTier: number[] = [];
  rs.map((r, i) => [r, i] as const)
    .filter((x): x is readonly [number, number] => x[0] != null)
    .sort((a, b) => a[0] - b[0])
    .forEach(([r, i]) => {
      let t = 0;
      while (lastInTier[t] != null && r - lastInTier[t] < gap) t++;
      lastInTier[t] = r;
      tiers[i] = t;
    });
  return tiers;
}
