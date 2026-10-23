# Brix Brewhouse — Implementation Kickstart

Concept: **"The Firehouse Is Pouring Again."** The site is the building. You arrive at a closed bay door, it rolls up, and every section is a room: the bay, the bar top, the kitchen, Eli's Lounge, the stage, the street out front.

Status legend: `[ ]` to do · `[x]` done · `[~]` in progress / partially done · `[!]` blocked, waiting on Hunter.
Rule: items are ticked, never deleted. Each phase ends with a review stop.

Branch: `claude/ecstatic-wright-639aqq` · Stack: Next.js (App Router) + TypeScript + Tailwind + GSAP/ScrollTrigger + Lenis + Framer Motion.
Skills applied throughout: `design-taste-frontend` and `impeccable` (both installed; loaded at the start of Phase 1 and re-checked in Phase 6).

---

## Phase −1 — Plan (this step)

- [x] Read the full brief
- [x] Confirm Higgsfield MCP is connected (balance: **1,210 credits**, plan: Plus)
- [x] Discover current models (`models_explore`) and quote costs with `get_cost` (no credits spent)
- [x] Confirm brand assets are reachable (logo PNG 200 OK, YouTube embed 200 OK)
- [x] Write `implementation_kickstart.md` (this file)
- [x] Write `assets_plan.md` with prompts, models and credit estimates
- [x] List clarifying questions (bottom of this file)
- [x] Hunter approves `assets_plan.md` and its credit total

---

## Phase 0 — Higgsfield assets (only after credit approval)

Setup
- [~] Create Higgsfield project "Brix Brewhouse Concept" so all generations stay in one folder (skipped: account preference is no auto-projects; job IDs logged in assets_plan.md instead)
- [x] Create `/assets/raw/` (gitignored) and `/assets/processed/`
- [x] Install processing tools: `sharp` (WebP/AVIF), `potrace` (logo trace), confirm ffmpeg has libwebp + libvpx-vp9

Hero keyframes (H) — generate H4 first, then each earlier frame as a reference edit of the next
- [x] H4 macro pint — drafts (3 variants) → Hunter picks
- [x] H3 tap pour (reference: H4) — drafts → pick
- [x] H2 open bay / glowing brewhouse (reference: H3) — drafts → pick
- [x] H1 closed bay door at dusk (reference: H2) — drafts → pick
- [x] Portrait 9:16 versions of H1–H4 (reference: each chosen 16:9 frame)
- [x] Contact sheet of all keyframes sent for review

Hero clips (first + last frame)
- [x] Model bake-off: one H1→H2 clip on Kling 4.0 vs Kling 3.0 Pro → pick the model
- [x] Desktop clips: H1→H2, H2→H3, H3→H4
- [x] Portrait clips: H1→H2, H2→H3, H3→H4
- [x] Review clips (mid-frames sent as stills) and re-roll only the failures

Loops, textures, Visit
- [x] P1 bubbles, P2 nitro cascade, P3 amber pour — still → loop (start frame = end frame)
- [x] T1 brick, T2 stainless, T3 walnut, T4 chalkboard, T5 bottle-cap mosaic
- [x] V1 Pocono ridgeline loop

Nice-to-have (each one only if approved)
- [x] F1–F4 food stills (illustrative)
- [x] N1 night exterior (generic, illustrative)
- [x] A1 taproom ambience (audio pulled from a sound-on video clip)
- [~] U1 logo upscale as trace source (not needed: the PNG traced cleanly)

Processing
- [x] Join desktop clips → ~300 WebP frames @1920px, ≤ ~15 MB total → `/public/frames/desktop/`
- [x] Join portrait clips → ~300 WebP frames @720px → `/public/frames/mobile/`
- [x] `poster.jpg` for desktop + mobile; all-keyframe MP4 fallback (`-g 1`)
- [x] Loops → H.264 MP4 (faststart, no audio) + WebM, ≤ 2.5 MB each, with posters → `/public/video/`
- [x] Textures → make tileable (offset + seam blend), export WebP + AVIF ≤ 300 KB → `/public/tex/`
- [x] Write `frames.manifest.json` (count, size, path pattern) and verify it matches the files on disk
- [x] Log model, prompt, settings and job ID for every kept asset in `assets_plan.md`
- [x] Review stop (Hunter: "go through until completion", so stops are self-reviews)

---

## Phase 1 — Foundation, design system, age gate, cinematic hero

Project
- [x] Scaffold Next.js (App Router, TS, Tailwind, ESLint), `src/` layout
- [x] `.gitignore`: node_modules, .next, .env*, /assets/raw
- [x] Install GSAP + ScrollTrigger, Lenis, Framer Motion; code-split GSAP plugins
- [x] `vercel.json` with immutable long-cache headers for `/frames`, `/video`, `/tex`
- [x] `<meta name="robots" content="noindex">` (concept-site safety)

Brand assets
- [x] Download logo PNG to `/public/brand/`
- [x] Sample the logo's red; set Fire Red to the logo value (brief default `#E10600`)
- [x] Trace a crisp SVG with potrace, hand-clean the paths, compare overlay vs PNG (no changes to the mark)
- [x] White version + small monogram ("B") version
- [x] Favicon set from the monogram, apple-touch-icon, theme-color `#111214`

Design system
- [x] CSS variables: Brix Black, Fire Red, Pour Gold, Foam White, Brick, Mortar, Stainless, Walnut (+ derived tints, focus ring, surfaces)
- [x] Colour rules written into tokens: red = fire/CTA only, gold = beer/light/glow, black dominates
- [x] Contrast check: gold and red text on black, at every size used (WCAG AA; Lighthouse color-contrast passes; red-button labels kept as large text)
- [x] next/font: Big Shoulders Display, Fraunces Italic, Inter, JetBrains Mono, Caveat
- [x] Type scale with `clamp()` up to ~14vw for hero words; tight tracking; intentional edge cropping
- [x] Primitives: `BayLabel` ("BAY 01"), `MonoLog`, `ConfirmToken` (visible `{{CONFIRM}}` chip), `PhotoSlot` (framed, brass clips, label), `IllustrativeCaption`
- [x] `TapHandleButton` (handle tilts on hover, gold pour line draws under label)
- [x] Film grain overlay (3–4%), CSS/SVG noise, no per-frame JS
- [x] Cap cursor (desktop, pointer:fine only, interactive targets only, off for reduced motion)
- [x] Lenis smooth scroll wired to ScrollTrigger; disabled for reduced motion
- [x] Easing tokens: heavy/mechanical (doors, pours) and soft (text)

Shared logic
- [x] `/data/hours.json` + `lib/hours.ts` (America/New_York open/closed, next opening)
- [x] Unit tests (Vitest): midnight, Fri/Sat 11 PM close, Sunday, DST spring-forward and fall-back, holiday note
- [x] `StatusPill` component with aria-live

Nav + Brix Gauge
- [x] Minimal nav (logo, section links, "Pour One With Us" CTA)
- [x] BRIX GAUGE: fixed right-edge refractometer scale, 0–20 °Bx ticks (decorative), gold level follows scroll, section ticks clickable, keyboard reachable, hidden on mobile
- [x] Skip link, landmarks

Age gate (BAY 00)
- [x] Full-screen H1 poster, logo badge with soft glow, "BAY 00 / AGE CHECK", "Are you 21 or older?"
- [x] "Yes, open the door" (red, primary) → plays first ~15% of the hero sequence, lands in hero
- [x] "Not yet" → "Come back when you're 21. The Birch Beer will be waiting." + responsibility.org link
- [x] sessionStorage memory; focus trap; Esc does not dismiss; real buttons
- [x] Page content is server-rendered under the gate so crawlers and link previews see metadata

Hero (Signature Moment 1)
- [x] `components/hero/SequenceCanvas.tsx`: canvas + preloaded Image objects, every 16th frame first then fill, eased lerp scrub, DPR ≤ 2, cover fit, portrait set on mobile, poster until ready, pauses off-screen
- [x] Overlays: 0–25% "BRIX" + mono line · 25–55% "A {{1953}} Firehouse. A New Pour." · 55–85% "Small batch. Brewed in-house. Nine taps." / "Good beer isn't rushed." · 85–100% CTA + status pill + hours
- [x] "ILLUSTRATIVE RENDER" caption bottom-left; canvas has an aria-label
- [x] Reduced motion: static poster/final frame, overlays stacked, no scrub
- [x] Poster preloaded as LCP
- [x] Playwright: age gate → yes → hero at 0/30/60/95% @1440×900 and 390×844; zero console errors
- [~] Perf check: scrub holds 60fps — median frame 16.7 ms (60 fps) in a GPU-less headless browser; p95 33 ms because the canvas is software-rastered there. Verify on a real laptop.
- [x] Commit + push · Review stop

---

## Phase 2 — "Three Meanings of Brix" + Flight Builder (On Tap)

BAY 01 — Three Meanings (Signature Moment 2)
- [x] Pinned black section; BRIX built from T1 brick tiles with real mortar gaps, staggered fly-in, weighted settle
- [x] Meaning 1 "BRIX (°Bx)": letters fill with rising gold liquid (hydrometer)
- [x] Meaning 2 "BRICK": Saylorsburg, biggest brick supplier in the country in 1894; letters go pure brick; ledger-style mono labels
- [x] Meaning 3 "THE FIREHOUSE": red enamel edge + bay-number stencil
- [x] Founders line + "Photo: Joe & Chris" slot
- [x] Reduced motion: three static panels

BAY 02 — Build Your Flight (Signature Moment 3)
- [x] `/data/taps.json`: 6 house beers with real stats; Pale Ale, Hazy IPA, Belgian White with "—" stats + `{{CONFIRM}}`; Birch Beer (NA); Weyerbacher guest tap; "updated" date token
- [x] "Taps rotate. Here's what's been pouring." note + `{{CONFIRM}}` updated date
- [x] Tap handle row (SVG, blank handles, mono labels "TAP 01 / PILSNER LAGER / 5.5% / IBU 10")
- [x] Walnut paddle (T3) with 4 SVG glass slots (highlights, rim, base)
- [x] Click / drag / tap a handle → handle pulls → stream pours into next empty glass
- [x] Liquid renderer (dynamic import; Canvas 2D, starts when the paddle nears the viewport): colour from beer's colour field, Hazy Gold turbulence, bubbles, settling foam head
- [x] Remove/replace a glass; reset flight
- [x] "Your Flight" card: 4 beers + ABV, lightest → richest meter from real ABV/IBU, "Share my flight" (hash URL, reopens same flight), "Pour this flight in person →"
- [x] Unconfirmed beers show "Ask your bartender"
- [x] Birch Beer toggle (dark pour with its own foam)
- [x] Weyerbacher guest tap card (text only), growlers & crowlers info
- [x] P1/P2 loops behind the paddle, low opacity, paused off-screen
- [x] Accessibility: keyboard pours, aria-live ("Session IPA added, 2 of 4"), list fallback
- [x] Playwright: full flight on desktop and touch emulation; share URL round-trip
- [x] Commit + push · Review stop

---

## Phase 3 — The Bar Top / Built by Hand + Kitchen & Menu

BAY 03 — The Bar Top (Signature Moment 4)
- [x] Background T5 cap mosaic under glass + "ILLUSTRATIVE RENDER"
- [x] Specular glare follows cursor / device tilt (permission-safe on iOS; static for reduced motion)
- [x] Six highlighted caps flip in 3D to mono-logged stories: 40 HOURS (Lindsay) · 107 DAYS (Eli) · 1 SHUFFLEBOARD · 5 BAY DOORS · LOCAL ART (Larry Meag) · {{1953}}
- [x] Caps are real buttons; flip by click/Enter/Space; text readable without flipping for screen readers
- [x] Framed photo slots with brass corner clips: "Photo: the bottle-cap bar", "Photo: Eli's Lounge woodwork", "Photo: Larry Meag mural"
- [x] Headline "Some breweries are built. This one was made."

BAY 04 — John's Chef Table
- [x] Chef John Kiley intro (24 years, soups, house-smoked meats, local ingredients) + "Photo: Chef John" slot
- [x] Chalkboard (T4) with Caveat lettering, chalk stroke-reveal on enter, driven by JSON (Today's Special / Soup of the Day placeholders)
- [x] Taco Tuesday badge auto-highlights on Tuesdays (America/New_York)
- [x] `/data/menu.json` with every item and real price
- [x] Editorial two-column menu, dotted leaders, category tabs, sticky category nav on mobile
- [x] "Pairs with" chips (pretzel board → Amber Ale, BBQ pork → Brown Ale, nachos → Session IPA), "House suggestion" + `{{CONFIRM}}`
- [x] Fan favorite callout: Pale Ale + Maryland crabcake pretzel `{{CONFIRM}}`
- [x] Kitchen hours `{{CONFIRM}}` (12–3 & 5–8 vs. full menu until 8 PM) + "Pretzels and hotdogs served all day."
- [x] Food imagery: F1–F4 with "Illustrative, not the actual dish" if approved, otherwise photo slots
- [x] Playwright: flip three caps; menu tabs; mobile sticky nav
- [x] Commit + push · Review stop

---

## Phase 4 — Eli's Lounge + What's Happening + Play

BAY 05 — Eli's Lounge
- [x] Walnut (T3) section, "Eli's Lounge. Seats 50. Built by Eli."
- [x] Story paragraph on Eli's 107 days of carpentry (facts only)
- [x] Good for: birthdays, showers, team nights, fundraisers, watch parties
- [x] "Large group? Call ahead" + tap-to-call
- [x] CTA opens the shared modal on "Private Event"

BAY 06 — Dispatch board
- [x] `/data/events.json`; rows DAY · EVENT · STATUS
- [x] Split-flap animation (CSS 3D, reduced-motion = static)
- [x] Taco Tuesday confirmed; every other event day shows "SEE FACEBOOK" or `{{CONFIRM}}`
- [x] PLAY: pool tables, cornhole, firemen's shuffleboard (puck-slide micro-animation on hover)
- [x] Instagram + Facebook follow buttons
- [x] Commit + push · Review stop

---

## Phase 5 — Press, Visit, FAQ, Footer, CTA modal

BAY 07 — Press
- [x] Two framed-clipping cards (WNEP Aug 20 2025, Times News Aug 15 2026), paraphrased one-liners, "Read the story →"
- [x] Lite YouTube embed (click-to-load, custom gold play button, no iframe until click)

BAY 08 — Visit
- [x] V1 loop background (darkened) + brick side bands
- [x] Live status pill (3 states + pulsing gold dot when open) + "Holiday hours may vary"
- [x] Hours table, today highlighted; address + "Formerly the West End Firehouse"
- [x] Buttons: Get Directions, Call (570) 213-9298, Email
- [x] Stylized SVG map (Route 715 line, monogram pin; no unconfirmed landmarks) + click-to-load Google Maps
- [x] Good-to-know chips
- [x] Two muted sample review cards: "Sample: replace with a real guest review"

FAQ
- [x] `/data/faq.json` accordion with all listed topics (facts from the brief only)
- [x] FAQPage JSON-LD

Final CTA + footer
- [x] "THE DOOR'S OPEN." / "Come pour one with us." over N1 (if approved) or brick/ink composition
- [x] Footer: logo, address, phone, email, hours, socials, "Drink local.", responsibility line, © Brix Brewhouse, concept + AI-imagery line

One CTA, one modal
- [x] Bay-door slide-up modal, tabs: VISIT (default) · LARGE GROUP · PRIVATE EVENT
- [x] Client-side validation only, nothing sent anywhere; success states with `{{CONFIRM}}` for response times
- [x] Focus trap, Esc closes, returns focus, aria-modal

Mobile action bar
- [x] Call · Directions · Menu, safe-area insets, hidden while gate/modal open
- [x] Playwright: each modal tab; status pill with clock mocked to Tue 1 PM, Fri 10:30 PM, Sun 9:30 PM
- [x] Commit + push · Review stop

---

## Phase 6 — Motion polish, performance, accessibility, metadata, QA

Motion & taste
- [x] Re-run `design-taste-frontend` + `impeccable` review on every section (detector pass + fresh finish reviewer)
- [x] Section-to-section transitions tuned (heavy for doors/pours, soft for text)
- [x] Sound toggle: off by default, quiet (35% with fade), A1 audio low-passed so no speech is intelligible

Performance
- [~] Lighthouse mobile: Perf 89-90 (devtools throttling, localhost; simulated throttling scores lower), A11y 100, Best Practices 100, SEO 100 except the deliberate concept `noindex`. Re-measured after the finish-review fixes on a slower container: 79 for both the old and new build side by side (no regression), CLS 0.002 after the metric fallback font.
- [x] CLS 0.029; LCP 2.7 s (the BRIX wordmark / gate badge, which wait for the display face); JS split per room, liquid renderer, YouTube and Maps load on demand
- [x] Videos and canvases pause off-screen

Accessibility (WCAG 2.2 AA)
- [~] axe (Lighthouse a11y 100) and keyboard paths for gate, modal, flight, caps, FAQ verified; a real screen-reader pass (VoiceOver/NVDA) still to do
- [x] Tap targets ≥ 44px; reduced-motion equivalents verified

Metadata
- [x] Title, description, OG + Twitter `summary_large_image` (OG host follows the deployment)
- [x] `og-image.png` 1200×630 composed in code (H4 frame + SVG logo + "THE FIREHOUSE IS POURING AGAIN")
- [x] JSON-LD: Brewery (schema.org has no BreweryDistillery type) + Menu + FAQPage, parsed and checked

QA (the "can't refuse" bar)
- [x] Responsive at 360 / 390 / 768 / 1024 / 1440 / 1920; no horizontal scroll
- [x] Full Playwright suite at 1440×900 and 390×844 (scripts/qa.mjs, 47 checks); screenshots reviewed
- [x] Zero console errors; frame manifest matches disk (271 + 271)
- [x] Fact audit against brief §1; every unknown shows `{{CONFIRM}}`; every generated visual labelled; no fake reviews
- [x] Taste test: Site of the Day? Screenshot-worthy bay door, brick BRIX, flight builder, cap bar? Lindsay, Eli and Chef John find themselves? Hungry phone user finds hours/directions/menu in 5 s?
  - Fresh-eyes finish reviewer, two rounds (verdict "fix" both times). Fixed: raster caps, maple, newsprint with torn edge, brick-course thresholds, gold-leaf final headline, edge-cropped press title, enamel placard, footnote strip, gate logo (was rendering 0x0), static hero occlusion, 1953 footnote, meter label collisions.
  - Declined with evidence: items the reviewer called invented are verbatim in the brief (main bar, walk-ins, no dogs, geo, small batch, exact press headlines); brief-pinned mono labels and the full FAQ stay.
  - Known gap: flight glasses are vector vessels over the walnut raster, not raster glass.
- [x] DESIGN.md + `.impeccable/design.json` written from the shipped build (impeccable documenter, run inline)
- [x] Final commit + push · Review stop

---

## `{{CONFIRM}}` register (facts the owners must confirm)

| Token | Where | Why |
|---|---|---|
| 1953 | Hero, Bar Top, Three Meanings | Own site says 1953; a listing says 1932 (fire company chartered 1932) |
| Kitchen hours | Kitchen, FAQ | "12–3 and 5–8" vs "full menu until 8 PM daily" |
| Pale Ale, Hazy IPA, Belgian White stats | On Tap | Mentioned in press only |
| Taps "updated" date | On Tap | Owners set this |
| Pairing chips | Menu | Our suggestion, not theirs |
| Pale Ale + crabcake pretzel | Menu | Press mention only |
| Event days (except Taco Tuesday) | Dispatch board | Not published |
| Modal response times | CTA modal | Not published |

## Clarifying questions

1. **Credits.** OK to spend ≈ 240 credits on must-haves (≈ 325 if Kling 3.0 Pro wins the bake-off) and ≈ 94 on the nice-to-haves? Worst case ≈ 420 of your 1,210. See `assets_plan.md`.
2. **Hero clip model.** Kling 4.0 (≈ 5 credits per 5 s clip) as primary with a quick bake-off against Kling 3.0 Pro (≈ 8.75)? Or pay for Cinema Studio Video 3.0 (≈ 65 per clip, ≈ 390+ for six) for the hero only?
3. **Taproom sound.** Higgsfield has no standalone sound-effects model. Options: (a) generate a sound-on Kling clip of a taproom and keep only its audio (≈ 25–50 credits, quality uncertain), (b) I source a CC0/royalty-free loop and log its licence, (c) skip the toggle.
4. **Previews.** Should I deploy a Vercel preview after each phase (the Vercel connector is attached), or keep it local with screenshots only?
5. **Real photos.** Do you have any owner-supplied photos (bar top, Eli's woodwork, mural, exterior) to drop into the slots now, or do all slots stay labelled placeholders for the demo?
