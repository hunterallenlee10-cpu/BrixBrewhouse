# Product

<!-- impeccable:product-schema 1 -->

> Source: written from Hunter's project brief (2026-10-23). Hunter told us to proceed without an interview, so every line below is inferred from that brief, not from a separate Q&A.

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, Motion. Named in the brief. Front-end only: no backend, no database, forms validate client-side and send nothing.

## Users

1. **The owners (first audience):** Joe Elias and Chris Pohorenco, co-owners of Brix Brewhouse. They will open a concept link from Lee Enterprises Unlimited and decide whether to buy it. Success: they feel someone finally understood their place.
2. **Guests (the site's real job):** locals and Pocono visitors, often on a phone, often hungry, deciding where to go tonight. They need hours, directions and the menu within seconds.
3. **Groups and event planners:** people booking Eli's Lounge (seats 50) or calling ahead for large parties.

## Product Purpose

Get people through the door of Brix Brewhouse, and tell the building's real stories well enough that guests arrive already attached to the place.

## Positioning

The only brewery inside the former West End Firehouse on Route 715, named three ways at once: Brix (sugar in the wort), brick (Saylorsburg, the owners' hometown, was the country's biggest brick supplier in 1894), and the brick firehouse itself. Built by hand: Eli's 107 days of carpentry, Lindsay's 40 hours of bottle caps, Larry Meag's art, the firemen's shuffleboard still in play.

## Operating Context

- Phone-first visits: hours, directions, call, menu.
- Desktop visits: owners and planners exploring the story, flights and events.
- Taps rotate; the menu, events and hours change. Owners must be able to edit `/data/*.json` without touching code.

## Capabilities and Constraints

- Nine rotating taps, flights of four, growler and crowler fills, house Birch Beer (non-alcoholic), Weyerbacher guest taps.
- John's Chef Table kitchen; Taco Tuesday; daily chalkboard specials.
- 21+ age gate required (brewery).
- No dogs (for now). Mostly first-come, first-served; call ahead for large groups.
- Undecided / conflicting facts are shown as visible `{{CONFIRM}}` tokens (see implementation_kickstart.md).
- Concept-site safety: `noindex` and a concept credit in the footer until purchased.

## Brand Commitments

- Logo badge (BRIX / BREWHOUSE, wheat, split red-and-white "B"). Traced, never redrawn.
- Colors from their current site, elevated: Brix Black, Fire Red (matched to the logo red), Pour Gold, Foam White.
- Their lines: "A 1953 Firehouse. A New Pour." · "The walls hold stories. The taps pour something new." · "Come Pour One With Us" · "We'll save you a seat." · "Good beer isn't rushed." · "Drink local."
- Must not look like a theme park: no clip-art flames, no Dalmatians, no fire-hose borders, no grunge overload.

## Evidence on Hand

- Real: business facts, menu with prices, beer stats for six house beers, hours, address, phone, email, socials, two press articles (WNEP 2025, Times News 2026), one YouTube video.
- Not on hand: photos of the owners, Chef John, Eli's woodwork, the bottle-cap bar, the Larry Meag mural, the real building. These are labelled photo slots.
- Never fabricated: reviews, ratings, awards, beer stats, event days, prices, history. Two sample review cards are visibly labelled as samples.
- Generated imagery is illustration and is labelled "ILLUSTRATIVE RENDER" or "Illustrative, not the actual dish".

## Product Principles

1. Their stories, not ours: every fact traces to the brief; unknowns are visible.
2. The door is always one tap away: hours, directions, call and menu beat every effect.
3. Honor the hands that built it: Lindsay, Eli, Chef John and Larry Meag are named where their work lives.
4. Cinematic, never costume: the firehouse is a material and a rhythm, not a theme.

## Accessibility & Inclusion

WCAG 2.2 AA. Full reduced-motion equivalents for every effect. Keyboard-operable flight builder with live announcements. Tap targets ≥ 44px. Family-friendly audience; wheelchair-accessible venue.
