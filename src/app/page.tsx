import { SiteProvider } from "@/components/providers/SiteProvider";
import { AgeGate } from "@/components/gate/AgeGate";
import { LogoBadge } from "@/components/brand/LogoBadge";
import { Nav } from "@/components/nav/Nav";
import { BrixGauge } from "@/components/nav/BrixGauge";
import { MobileBar } from "@/components/nav/MobileBar";
import { CapCursor } from "@/components/ui/CapCursor";
import { Hero } from "@/components/hero/Hero";
import { ThreeMeanings } from "@/components/meanings/ThreeMeanings";
import { FlightBuilder } from "@/components/flight/FlightBuilder";
import { BarTop } from "@/components/bartop/BarTop";
import { Kitchen } from "@/components/kitchen/Kitchen";
import { ElisLounge } from "@/components/lounge/ElisLounge";
import { DispatchBoard } from "@/components/dispatch/DispatchBoard";
import { Press } from "@/components/press/Press";
import { Visit } from "@/components/visit/Visit";
import { Faq } from "@/components/faq/Faq";
import { FinalCta } from "@/components/cta/FinalCta";
import { Footer } from "@/components/footer/Footer";
import { PourModal } from "@/components/cta/PourModal";

/** The building, room by room: door, bay 01-08, the street out front. */
export default function Page() {
  return (
    <SiteProvider>
      <a href="#main" className="t-mono fixed left-3 top-3 z-[95] -translate-y-24 bg-gold px-4 py-3 text-[0.72rem] text-black focus:translate-y-0">
        Skip to content
      </a>
      <AgeGate logo={<LogoBadge />} />
      <Nav />
      <BrixGauge />
      <main id="main">
        <Hero />
        <ThreeMeanings />
        <FlightBuilder />
        <BarTop />
        <Kitchen />
        <ElisLounge />
        <DispatchBoard />
        <Press />
        <Visit />
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
