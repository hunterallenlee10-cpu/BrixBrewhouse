import dynamic from "next/dynamic";
import { featuredBeer, getLiveBeers } from "@/lib/tapSheet";

// still code-split for hydration, as before; the server reads the tap list first
const FlightBuilder = dynamic(() => import("./FlightBuilder").then((m) => m.FlightBuilder));

/** BAY 03 with whatever is on tap right now (the owners' sheet, cached for about a minute). */
export async function OnTap() {
  const { beers, source } = await getLiveBeers();
  return <FlightBuilder beers={beers} source={source} featuredId={featuredBeer(beers)?.id} />;
}
