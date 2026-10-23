"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/providers/SiteProvider";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { SoundToggle } from "./SoundToggle";
import { NAV_LINKS } from "./sections";

export function Nav() {
  const { scrollTo } = useSite();
  const [solid, setSolid] = useState(false);

  // solid once the hero hands over to the first room
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#brix",
      start: "top 60%",
      end: "max",
      onToggle: (self) => setSolid(self.isActive),
    });
    return () => st.kill();
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(`#${id}`, { duration: 1.6 });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-b border-line bg-black/85 backdrop-blur-md" : "border-b border-transparent bg-gradient-to-b from-black/70 to-transparent"
      }`}
      style={{ zIndex: "var(--z-nav)" as unknown as number, height: "var(--nav-h)" }}
    >
      <nav aria-label="Primary" className="wrap flex h-full items-center justify-between gap-4">
        <a href="#top" onClick={go("top")} className="flex shrink-0 items-center gap-3" aria-label="Brix Brewhouse, back to the door">
          <img src="/brand/brix-logo-white.svg" alt="" width={40} height={39} className="h-10 w-auto" />
          <span className="t-display hidden text-[1.35rem] text-foam sm:inline">Brix Brewhouse</span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={go(l.id)}
                className="t-mono inline-flex h-11 items-center px-3 text-[0.72rem] text-foam/85 transition-colors hover:text-gold-hi"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 sm:gap-3">
          <SoundToggle compact />
          <TapHandleButton size="sm" className="hidden sm:inline-flex" />
        </div>
      </nav>
    </header>
  );
}
