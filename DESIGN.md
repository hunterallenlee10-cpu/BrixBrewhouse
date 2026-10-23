---
name: Brix Brewhouse
description: The Firehouse Is Pouring Again. A one-page taproom site built as the rooms of a restored firehouse.
colors:
  brix-black: "#111214"
  ink-0: "#0b0c0d"
  ink-2: "#17181b"
  ink-3: "#1f2024"
  fire-red: "#ea0322"
  fire-red-deep: "#b5021a"
  pour-gold: "#d69e14"
  pour-gold-hi: "#f0bf45"
  foam: "#f2f2f2"
  text-2: "#c9c3b9"
  text-3: "#8f8a83"
  brick: "#8e3b2c"
  mortar: "#cfc6ba"
  stainless: "#a9aeb3"
  walnut: "#4a2e1e"
  line: "rgb(242 242 242 / 0.12)"
  line-strong: "rgb(242 242 242 / 0.24)"
typography:
  display:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(3.6rem, 11vw, 10rem)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
  stencil:
    fontFamily: "Big Shoulders Stencil, Big Shoulders, sans-serif"
    fontSize: "clamp(1.7rem, 2.4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
  serif:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.015em"
    fontVariation: "'SOFT' 100, 'WONK' 1, 'opsz' 96"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.08em"
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
  enamel: "10px"
  round: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  section: "clamp(5rem, 12vw, 10rem)"
  container: "1400px"
  gauge-rail: "72px"
components:
  button-tap:
    backgroundColor: "{colors.fire-red}"
    textColor: "{colors.foam}"
    rounded: "{rounded.none}"
    padding: "0 24px 0 16px"
    height: "56px"
  button-tap-hover:
    backgroundColor: "{colors.fire-red-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foam}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "56px"
  confirm-chip:
    backgroundColor: "rgb(214 158 20 / 0.1)"
    textColor: "{colors.pour-gold-hi}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.18em 0.45em"
  enamel-placard:
    backgroundColor: "{colors.fire-red-deep}"
    textColor: "{colors.foam}"
    rounded: "{rounded.enamel}"
    padding: "clamp(1.5rem, 3vw, 2.25rem) clamp(1.25rem, 3.5vw, 2.75rem)"
---

# Design System: Brix Brewhouse

## Overview

**Creative North Star: "The Firehouse Is Pouring Again"**

The page is one building, walked room by room. You arrive at a closed bay door, are let in, and every section after that is a bay of the firehouse: the brewhouse, the bar top, the kitchen, Eli's Lounge, the run board, the street out front. Brix Black is the night the building stands in. Pour Gold is the only light: beer, Edison bulbs, active states, the glow leaking under the door. Fire Red is enamel and the single call to act. Everything else is a material the building is actually made of (brick, mortar, walnut, brushed stainless, bottle caps under glass) rendered as raster, never imitated with gradients.

Density is editorial: one idea per viewport, huge condensed civic type cropped by the viewport, long dark fields between rooms, and small mono labels carrying the data the way a brew sheet or dispatch log would. Motion is heavy and weighted, like a rolling door: things settle; they don't bounce.

Rejected outright: the craft-brewery default (centred beer photo over cream, three amenity cards, stock taproom gallery) and firehouse theme-park dressing (clip-art flames, Dalmatians, hose borders, grunge overload).

**Key Characteristics:**
- Dark ground at page scale; gold is light, red is enamel and the CTA.
- Real materials as fields and objects, each a labelled illustrative raster.
- Civic signage type, huge and edge-cropped; a warm italic serif for human moments; mono for data.
- Square corners and 1px hairlines; round only for round things (caps, dots); 10px only for enamel signs.
- Every unknown fact is a visible `{{CONFIRM}}` chip, never a guess.

## Colors

A blackout palette with one warm light and one enamel red, plus the building's own materials.

### Primary
- **Pour Gold** and **Pour Gold High**: the beer, the light and the glow. Used for bay labels, focus rings (`--focus`), the Brix Gauge fill, live status dots, hover pour-lines, active filters, and selection. Gold High is the text-safe tint on black.

### Secondary
- **Fire Red** (logo-sampled) and **Fire Red Deep**: the primary CTA ("Pour One With Us"), the gate's "Yes", enamel signage (the house-rules placard, the Firehouse strip in Three Meanings), and its pressed/hover state.

### Tertiary (materials)
- **Brick**, **Mortar**, **Walnut**, **Stainless**: the building's materials. They appear mostly as raster textures (`/tex/*`); the flat values back those textures, tint scrollbars, and set mortar-warm secondary text.

### Neutral
- **Brix Black**: the page ground everywhere.
- **Ink 0 / Ink 2 / Ink 3**: frames, wells and sheets one step off the ground (photo slots, clipping frames, flight sheet).
- **Foam**: primary text and headline white.
- **Text 2** (mortar-tinted, 10.9:1 on black): body copy. **Text 3** (5.4:1): tertiary captions.
- **Line / Line Strong**: 1px hairline rules and outlines.

### Named Rules
**The One Light Rule.** Gold is the only light source. Glows, highlights, and active states are gold; never blue, white neon, or a second accent.

**The Enamel Red Rule.** Red is for fire-service enamel, real red objects in the building (a bottle cap, a shuffleboard weight), and the single CTA. If it isn't a sign, an object, a gate "Yes", or "Pour One With Us", it isn't red.

**The Real Material Rule.** Brick, wood, steel, paper and caps are raster textures with an "Illustrative render" caption. CSS gradients may shade a material; they never stand in for one.

## Typography

**Display Font:** Big Shoulders (static 700/800; fallback is local bold Arial at `size-adjust: 70%`, measured to match its width so wraps never shift on swap)
**Bay Label Font:** Big Shoulders Stencil (700)
**Serif Font:** Fraunces italic (with Georgia)
**Body Font:** Manrope (with system-ui)
**Label/Mono Font:** JetBrains Mono

**Character:** Civic fire-service signage at poster scale, softened by a warm, slightly wonky italic for the people's stories, and grounded by brew-sheet mono for every number.

### Hierarchy
- **Display** (800, uppercase, 0.86 leading, -0.01em): room titles and the hero wordmark. Room titles run `clamp(3.6rem, 11vw, 10rem)`. The hero wordmark ("Brix Brewhouse", white, centred low over the door) runs `clamp(5rem, 8vw, 8.5rem)` on desktop and stacks to two lines on phones; it sits inside the frame, never cropped. Only "They said it." in Press is allowed to crop off the viewport, by the full stop only.
- **Stencil** (700, uppercase, 0.1em): "BAY 0n" numerals that open each room, and the enamel placard heading.
- **Serif** (Fraunces italic 400, SOFT 100, WONK 1): human moments: the founders' story, room subtitles, "Come pour one with us."
- **Body** (Manrope 400, 1rem/1.6, max ~62ch): all explanatory copy.
- **Label** (JetBrains Mono, 0.6875-0.75rem, uppercase, 0.08em, tabular figures): tap specs ("TAP 04 / SESSION IPA / 5.9% / IBU 22"), dispatch rows, captions, the "Illustrative render" provenance line. Never below 11px.

### Named Rules
**The Brew Sheet Rule.** Numbers (ABV, IBU, times, dates, prices) are set in mono with tabular figures, like a brew log.

**The Human Italic Rule.** The serif italic is reserved for people and feeling. It never carries data or UI labels.

## Layout

One long scroll of full-width rooms on a 1400px container with fluid gutters (`clamp(1rem, 4vw, 3rem)`). On desktop (1024px and up) the right gutter widens to at least 72px for the fixed Brix Gauge rail. Rooms breathe with `clamp(5rem, 12vw, 10rem)` vertical padding, and most rooms are separated by a single brick course (a 28px band cut mortar-to-mortar from the brick texture). Inside rooms, compositions are asymmetric 12-column splits (4/8, 7/5) with deliberately offset objects (tilted clippings, staggered photo slots). Below 768px everything stacks to one column, and the mobile action bar (Call / Directions / Menu) is fixed at the bottom.

**The Five-Second Rule.** On a phone, hours, directions and the menu are reachable in one tap from anywhere via the fixed action bar.

## Elevation & Depth

Depth comes from objects lying on a dark ground, not from UI cards floating. Shadows are long, dark and neutral (never coloured): heavy ambient drops under physical objects (caps, clippings, photo prints, the run board), plus 1px inset highlights for machined edges. The only coloured light is gold, at the gate: the seam under the bay door and the halo behind the logo badge.

### Shadow Vocabulary
- **Object drop** (`0 40px 80px -40px rgb(0 0 0 / 0.95), 0 18px 30px -18px rgb(0 0 0 / 0.8)`): clippings, framed prints, the run board.
- **Cap lift** (`drop-shadow(0 14px 18px rgb(0 0 0 / 0.65)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.5))`): cut-out bottle caps sitting under the bar glass.
- **CTA drop** (`0 14px 30px -14px rgb(0 0 0 / 0.85)`): the red buttons.
- **Machined edge** (`inset 0 1px 0 rgb(255 255 255 / 0.35), inset 0 -1px 0 rgb(0 0 0 / 0.5)`): stainless frames.

### Named Rules
**The Neutral Shadow Rule.** Shadows are black. Coloured glow is light, and light is gold: the seam under the bay door and the halo behind the gate badge, nowhere else.

## Shapes

Square by default: buttons, frames, sheets, inputs and the modal have 0 radius and 1px hairline borders. Round is reserved for round objects (bottle caps, status dots, the shuffleboard weight, the play button). Enamel signage gets 10px corners, a white keyline and screws. Paper has a straight scissor cut on top and a torn bottom edge (a generated SVG mask). Bottle caps keep their real crimped silhouette from the photo cut-out.

## Components

### Buttons
- **Tap Handle (primary, the only CTA):** Fire Red, square, Big Shoulders 800 uppercase at 1.2-1.4rem (kept at 18.7px or larger so white-on-red passes AA as large text). A small tap handle sits left of the label. On hover or focus it pulls forward on its pivot (-26deg, door easing) and a gold pour-line draws under the words. Hover deepens to Fire Red Deep. Always opens the single "Pour One With Us" modal.
- **Ghost:** transparent with a Line Strong 1px border and Foam text; hover lifts the border to Foam with a 5% foam wash. Used for secondary choices ("Not yet").
- **Focus:** a 2px Pour Gold High outline, 3px offset, everywhere.

### Confirm Chip
- **Style:** mono, dashed 1px gold border, 10% gold wash, Gold High text, reading `{{CONFIRM}}`. On light paper or cream it switches to a near-black fill with Gold High text. It is never hidden behind a tooltip.

### Bay Label (signature)
- Stencil "BAY 0n" in gold, a short hairline, then the room name in mono. It opens every room and is the building's wayfinding system.

### Enamel Placard
- Red porcelain-enamel sign: Fire Red Deep field, a white keyline inset 6-8px, four screw heads, 10px corners, a stencil heading, and rows split by foam hairlines with diamond bullets. Used for house rules (Good to know).

### Photo Slot
- A dark framed print with brass corner clips, a camera glyph and "Photo: [what goes here]". It is the honest placeholder wherever a real photo (people, the real bar top, Larry Meag's mural) must go. It is never filled with generated imagery.

### Bottle Cap
- Photographed (generated, blank) caps cut out to alpha, 6 colours, with the stamped figure in stencil. The flip side is the liner raster with a cream liner disc carrying "LOG 0n", the story, and the credit. Each is a real toggle button whose accessible name holds the full story.

### Navigation
- Fixed top bar: logo badge, mono links (On Tap, Menu, Eli's Lounge, Events, Visit), a sound toggle and the Tap Handle. The Brix Gauge (a refractometer scale, 0-20 °Bx) on the right edge shows scroll progress and doubles as room navigation. On phones, a fixed bottom bar offers Call, Directions and Menu.

## Do's and Don'ts

### Do:
- **Do** open every room with a stencil Bay Label and give it a real material from the building.
- **Do** caption every generated visual "Illustrative render" (food: "Illustrative, not the actual dish") in mono at 11px or larger.
- **Do** set every number in mono with tabular figures.
- **Do** mark any unverified fact with a visible `{{CONFIRM}}` chip.
- **Do** let signature display words crop at the viewport edge, but never so far that the meaning changes.
- **Do** honour reduced motion with a fully static, complete page (the hero becomes a still on the door-open frame).

### Don't:
- **Don't** use gradient text, neon, or any glow that isn't gold light.
- **Don't** imitate a material with CSS (striped "wood", gradient "steel"); use the raster or leave it out.
- **Don't** use red for UI beyond the gate "Yes" and the CTA; elsewhere it belongs to enamel signs and real red objects.
- **Don't** round corners on UI; round only round objects, and 10px only on enamel.
- **Don't** generate people, the real logo, Larry Meag's art, signage or text in imagery.
- **Don't** add fire-service clip art: flames, Dalmatians, hose borders, helmet icons.
