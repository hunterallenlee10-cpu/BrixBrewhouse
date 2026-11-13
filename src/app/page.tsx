import { Threshold } from "@/components/ui/Threshold";
import dynamic from "next/dynamic";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { Nav } from "@/components/nav/Nav";
import { BrixGauge } from "@/components/nav/BrixGauge";
import { MobileBar } from "@/components/nav/MobileBar";
import { CapCursor } from "@/components/ui/CapCursor";
import { Hero } from "@/components/hero/Hero";
import { ThreeMeanings } from "@/components/meanings/ThreeMeanings";
const FlightBuilder = dynamic(() => import("@/components/flight/FlightBuilder").then((m) => m.FlightBuilder));
const BarTop = dynamic(() => import("@/components/bartop/BarTop").then((m) => m.BarTop));
const Kitchen = dynamic(() => import("@/components/kitchen/Kitchen").then((m) => m.Kitchen));
const ElisLounge = dynamic(() => import("@/components/lounge/ElisLounge").then((m) => m.ElisLounge));
const BeerGarden = dynamic(() => import("@/components/garden/BeerGarden").then((m) => m.BeerGarden));
const DispatchBoard = dynamic(() => import("@/components/dispatch/DispatchBoard").then((m) => m.DispatchBoard));
const Press = dynamic(() => import("@/components/press/Press").then((m) => m.Press));
const Visit = dynamic(() => import("@/components/visit/Visit").then((m) => m.Visit));
const Reviews = dynamic(() => import("@/components/reviews/Reviews").then((m) => m.Reviews));
const Faq = dynamic(() => import("@/components/faq/Faq").then((m) => m.Faq));
import { FinalCta } from "@/components/cta/FinalCta";
import { Footer } from "@/components/footer/Footer";
import { PourModal } from "@/components/cta/PourModal";

// Rooms below the fold are code-split so hydration runs in smaller pieces (still server-rendered).

/** The building, room by room: door, bay 01-09, what guests say, the street out front. */
export default function Page() {
  return (
    <SiteProvider>
      <a href="#main" className="t-mono fixed left-3 top-3 z-[95] -translate-y-24 bg-gold px-4 py-3 text-[0.72rem] text-black focus:translate-y-0">
        Skip to content
      </a>
      <Nav />
      <BrixGauge />
      <main id="main">
        <Hero />
        <ThreeMeanings />
        <Threshold />
        <BarTop />
        <Threshold />
        <FlightBuilder />
        <Threshold />
        <Kitchen />
        <Threshold />
        <ElisLounge />
        <Threshold />
        <BeerGarden />
        <Threshold />
        <DispatchBoard />
        <Threshold />
        <Press />
        <Threshold />
        <Visit />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileBar />
      <PourModal />
      <CapCursor />
      <div aria-hidden className="grain" />
    </SiteProvider>
  );
}
