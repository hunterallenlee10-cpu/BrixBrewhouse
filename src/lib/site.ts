// Single source for contact facts. Everything here comes from the brief.
export const SITE = {
  name: "Brix Brewhouse",
  url: "https://brixbrewhouse.com",
  phone: "(570) 213-9298",
  phoneHref: "tel:+15702139298",
  email: "info@brixbrewhouse.com",
  street: "128 PA-715",
  city: "Brodheadsville",
  region: "PA",
  zip: "18322",
  formerly: "Formerly the West End Firehouse",
  geo: { lat: 40.9595, lng: -75.4021 },
  directions:
    "https://maps.google.com/maps/dir/?api=1&destination=128+PA-715+Brodheadsville+PA+18322",
  mapEmbed:
    "https://maps.google.com/maps?q=128+PA-715+Brodheadsville+PA+18322&z=14&output=embed",
  instagram: "https://www.instagram.com/Brixbrewhouse",
  facebook: "https://www.facebook.com/p/Brix-Brewhouse-61577748595637/",
  responsibility: "https://www.responsibility.org/",
  youtubeId: "SU_3pZM1ZmU",
  press: [
    {
      outlet: "WNEP",
      date: "Aug 20, 2025",
      iso: "2025-08-20",
      headline: "Historic firehouse in Brodheadsville to brew new adventures as Brix Brewhouse",
      byline: "Emily Kress",
      summary: "Before the first pour: how the old West End Firehouse on Route 715 was set to become a brewery.",
      url: "https://www.wnep.com/article/news/local/monroe-county/historic-firehouse-brodheadsville-brew-adventures-brix-brewhouse-monroe-county/523-b598dd99-7728-4d96-bd4d-e3ab7055ba9c",
    },
    {
      outlet: "Times News",
      date: "Aug 15, 2026",
      iso: "2026-08-15",
      headline: "Flights in former firehouse; West End headquarters transformed to brewery",
      byline: "Lori R. Cooper",
      summary: "Inside the finished conversion: the beer, the flights and the kitchen that now fill the old West End headquarters.",
      url: "https://www.tnonline.com/20260815/flights-in-former-firehousewest-end-headquarters-transformed-to-brewery/",
    },
  ],
} as const;

export const CONFIRM = "{{CONFIRM}}";
