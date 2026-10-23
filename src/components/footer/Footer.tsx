import Image from "next/image";
import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { HOURS, weekSummary } from "@/lib/hours";
import { SITE } from "@/lib/site";

const label = "t-mono text-[0.64rem] text-text-3";
const link = "inline-flex min-h-11 items-center text-foam underline-offset-4 transition-colors hover:text-gold-hi hover:underline";

export function Footer() {
  const week = weekSummary();
  return (
    <footer className="relative border-t border-line bg-ink-0 pb-[calc(56px+env(safe-area-inset-bottom)+2.5rem)] pt-16 md:pb-10 md:pt-20">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex items-center gap-6 lg:col-span-5 lg:flex-col lg:items-start">
            <Image src="/brand/brix-logo.svg" alt="Brix Brewhouse" width={132} height={129} unoptimized className="h-24 w-auto md:h-32" />
            <p className="t-serif text-[clamp(2.6rem,6vw,4.6rem)] text-gold-hi">Drink local.</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <p className={label}>Find us</p>
              <address className="mt-3 not-italic leading-relaxed text-text-2">
                <span className="block text-foam">{SITE.street}</span>
                {SITE.city}, {SITE.region} {SITE.zip}
                <span className="mt-1 block text-sm text-text-3">{SITE.formerly}</span>
              </address>
              <a href={SITE.directions} target="_blank" rel="noopener noreferrer" className={`${link} t-mono text-[0.68rem]`}>
                Get directions
              </a>
            </div>
            <div>
              <p className={label}>Hours</p>
              <ul className="mt-3 space-y-1 text-text-2">
                {week.map((w) => (
                  <li key={w.days} className="tabular">
                    <span className="text-foam">{w.days}</span> {w.time}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-text-3">{HOURS.holidayNote}</p>
            </div>
            <div>
              <p className={label}>Say hello</p>
              <ul className="mt-1">
                <li>
                  <a href={SITE.phoneHref} className={link}>
                    {SITE.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SITE.email}`} className={`${link} break-all`}>
                    {SITE.email}
                  </a>
                </li>
              </ul>
              <ul className="mt-2 flex gap-2">
                <li>
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Brix Brewhouse on Instagram" className="grid h-11 w-11 place-items-center border border-line-strong text-foam transition-colors hover:border-gold-hi hover:text-gold-hi">
                    <InstagramLogo aria-hidden size={20} />
                  </a>
                </li>
                <li>
                  <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Brix Brewhouse on Facebook" className="grid h-11 w-11 place-items-center border border-line-strong text-foam transition-colors hover:border-gold-hi hover:text-gold-hi">
                    <FacebookLogo aria-hidden size={20} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-sm text-text-3 md:flex-row md:items-start md:justify-between">
          <p>
            <a href={SITE.responsibility} target="_blank" rel="noopener noreferrer" className="text-text-2 underline underline-offset-4 hover:text-foam">
              Please enjoy responsibly. 21+.
            </a>
            <span className="ml-3">© Brix Brewhouse</span>
          </p>
          <p className="max-w-[60ch] md:text-right">
            Concept preview by Lee Enterprises Unlimited. Some imagery is AI-generated illustration. Real photos coming soon.
          </p>
        </div>
      </div>
    </footer>
  );
}
