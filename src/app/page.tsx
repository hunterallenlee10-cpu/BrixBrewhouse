import { SiteProvider } from "@/components/providers/SiteProvider";
import { AgeGate } from "@/components/gate/AgeGate";
import { Nav } from "@/components/nav/Nav";
import { BrixGauge } from "@/components/nav/BrixGauge";
import { MobileBar } from "@/components/nav/MobileBar";
import { CapCursor } from "@/components/ui/CapCursor";
import { Hero } from "@/components/hero/Hero";
import { PourModal } from "@/components/cta/PourModal";
import { ThreeMeanings } from "@/components/meanings/ThreeMeanings";
import { FlightBuilder } from "@/components/flight/FlightBuilder";

export default function Page() {
  return (
    <SiteProvider>
      <a href="#main" className="t-mono fixed left-3 top-3 z-[95] -translate-y-24 bg-gold px-4 py-3 text-[0.72rem] text-black focus:translate-y-0">
        Skip to content
      </a>
      <AgeGate />
      <Nav />
      <BrixGauge />
      <main id="main">
        <Hero />
        <ThreeMeanings />
        <FlightBuilder />
      </main>
      <MobileBar />
      <PourModal />
      <CapCursor />
      <div aria-hidden className="grain" />
    </SiteProvider>
  );
}
