import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Big_Shoulders_Stencil, Caveat, Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import { HOURS } from "@/lib/hours";
import { FAQ, MENU } from "@/lib/data";
import "./globals.css";

const bigShoulders = Big_Shoulders({ subsets: ["latin"], axes: ["opsz"], variable: "--font-big-shoulders", display: "swap", adjustFontFallback: false });
const stencil = Big_Shoulders_Stencil({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-stencil", display: "swap", adjustFontFallback: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["italic"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-jetbrains", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat", display: "swap" });

const TITLE = "Brix Brewhouse | Craft Brewery in a Historic Firehouse | Brodheadsville, PA";
const DESCRIPTION =
  "A locally owned craft brewery inside the restored West End Firehouse on Route 715. Nine taps, flights of four, John's Chef Table kitchen and Eli's Lounge. Come pour one with us.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: DESCRIPTION,
  // Concept preview: keep out of search until the owners sign off.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE.name,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Brix Brewhouse: the firehouse is pouring again" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111214",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Brewery",
    name: SITE.name,
    description: DESCRIPTION,
    url: SITE.url,
    telephone: "+1-570-213-9298",
    email: SITE.email,
    image: `${SITE.url}/og-image.png`,
    logo: `${SITE.url}/brand/brix-logo.png`,
    servesCuisine: "American",
    priceRange: "$$",
    acceptsReservations: "False",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.zip,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: HOURS.days.map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${dayNames[d.day]}`,
      opens: d.open,
      closes: d.close,
    })),
    sameAs: [SITE.instagram, SITE.facebook],
    hasMenu: `${SITE.url}/#kitchen`,
  },
  {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: MENU.kitchenName,
    hasMenuSection: MENU.categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      hasMenuItem: c.items.map((i) => ({
        "@type": "MenuItem",
        name: i.name,
        ...(i.detail ? { description: i.detail } : {}),
        offers: { "@type": "Offer", price: i.price.toFixed(2), priceCurrency: "USD" },
      })),
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.replace("{{CONFIRM}}", "to be confirmed") },
    })),
  },
];

// Runs before first paint: skip the gate for returning guests, flag reduced motion.
const bootScript = `try{if(sessionStorage.getItem('brix-21')==='yes'){document.documentElement.dataset.gate='passed'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${stencil.variable} ${fraunces.variable} ${manrope.variable} ${jetbrains.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preload" as="image" href="/frames/desktop/poster.jpg" media="(min-width: 768px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/mobile/poster.jpg" media="(max-width: 767px)" fetchPriority="high" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
