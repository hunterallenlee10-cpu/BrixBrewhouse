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
  geo: { lat: 40.926, lng: -75.394 },
  directions:
    "https://maps.google.com/maps/dir/?api=1&destination=128+PA-715+Brodheadsville+PA+18322",
  mapEmbed:
    "https://maps.google.com/maps?q=128+PA-715+Brodheadsville+PA+18322&z=10&output=embed",
  instagram: "https://www.instagram.com/Brixbrewhouse",
  facebook: "https://www.facebook.com/p/Brix-Brewhouse-61577748595637/",
  responsibility: "https://www.responsibility.org/",
  youtubeId: "SU_3pZM1ZmU",
  press: [
    {
      outlet: "WNEP",
      date: "May 15, 2026",
      iso: "2026-05-15",
      headline: "Brix Brewhouse opens in former West End Fire House",
      byline: "",
      summary: "The doors are open: WNEP visits the brewery now pouring inside the former West End Fire House on Route 715.",
      // the owners' pick: WNEP's opening story, linked straight to the video
      url: "https://www.youtube.com/watch?v=zEcAEdmJDk0",
      cta: "Watch video",
    },
    {
      outlet: "Times News",
      date: "Aug 15, 2026",
      iso: "2026-08-15",
      headline: "Flights in former firehouse; West End headquarters transformed to brewery",
      byline: "Lori R. Cooper",
      summary: "Inside the finished conversion: the beer, the flights and the kitchen that now fill the old West End headquarters.",
      url: "https://www.tnonline.com/20260815/flights-in-former-firehousewest-end-headquarters-transformed-to-brewery/",
      cta: "Read the story",
    },
  ],
} as const;

