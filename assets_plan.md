# Brix Brewhouse — Higgsfield Asset Plan

**Status: waiting for approval. No credits spent yet.**
Balance at planning time (2026-10-23): **1,210 credits** (Plus plan).
All prices below are live quotes from Higgsfield's `get_cost` preflight, not guesses. Quotes were taken without reference images attached; I re-quote each job with its real inputs before submitting and stop if any price differs from this sheet.

---

## 1. Model choices (from the current `models_explore` catalogue)

| Job | Model (ID) | Why | Quoted cost |
|---|---|---|---|
| Stills, keyframes, textures, food | **Nano Banana Pro** (`nano_banana_pro`) @ 2K | Best photoreal model with multi-image reference editing — needed so H3/H2/H1 match H4's light and materials | **2 cr** per image (1K and 2K cost the same; 4K = 4) |
| Hero clips (first + last frame) | **Kling 4.0** (`kling4_0`), image-to-video, 1080p | Newest Kling, takes `start_image` + `end_image`, 1080p, 3–30 s | **5 cr** / 5 s, **8 cr** / 8 s |
| Fallback / bake-off | **Kling v3.0 Pro** (`kling3_0`, mode `pro`, sound off) | The brief's suggested model; proven first/last-frame control | **8.75 cr** / 5 s, **14 cr** / 8 s |
| Premium option (not in totals) | Cinema Studio Video 3.0 (`cinematic_studio_3_0`) 1080p | Highest cinematic quality | **65 cr** / 5 s |
| Taproom audio (nice-to-have) | Kling v3.0 Pro, sound **on**, 10 s | Higgsfield has no general sound-effects model (its SFX/music models are restricted to its game pipeline), so the audio track of a sound-on clip is the only route | **25 cr** / 10 s |
| Logo upscale (nice-to-have) | Topaz (`topaz_image`) or Bytedance Upscale | Cleaner edges for the potrace source | not quotable in advance; capped at 10 cr |

**Seamless loops:** every loop uses the **same still as both `start_image` and `end_image`**, so the clip returns to its first frame. Any leftover seam gets a short ffmpeg crossfade.

**Drafts:** Nano Banana Pro costs the same at 1K and 2K, so drafts are generated at final 2K quality, 2–3 variants each, and you pick. For video, the "draft" step is a single bake-off clip before committing to the full set.

---

## 2. Shared prompt blocks

**GRADE** (appended to every visual prompt):
> Color grade: deep inky blacks, warm Edison-gold practical light, aged brick red, cool brushed-stainless highlights. Photoreal, cinematic 35mm look, fine natural film grain, gentle haze. Absolutely no text, letters, numbers, logos, signage or labels anywhere; all tap handles, kegs, glassware and doors are blank and unbranded. No people, no faces, no hands.

**MOTION** (appended to every video prompt):
> Locked-off or very slow, perfectly smooth camera. One single clear motion. No shake, no cuts, no zoom pops, no people, no text. Silent.

---

## 3. MUST-HAVE assets

### H — Hero "The Bay Door" (BAY 00 → Hero)

Order: **H4 first**, then H3 as an edit of H4, H2 as an edit of H3, H1 as an edit of H2. Portrait versions use each chosen 16:9 frame as the reference.

> Continuity note: for the H3→H4 clip to work, H3 shows an empty pint glass under the faucet with the pour just starting. This is a small addition to the brief's H3 description.

| ID | Purpose | Model | Aspect / res | Variants | Est. cr |
|---|---|---|---|---|---|
| H4 | Full pint macro (hero end, OG image) | nano_banana_pro | 16:9 · 2K | 3 | 6 |
| H3 | Tap pour starting (ref H4) | nano_banana_pro | 16:9 · 2K | 3 | 6 |
| H2 | Bay open, brewhouse glowing (ref H3) | nano_banana_pro | 16:9 · 2K | 3 | 6 |
| H1 | Bay door closed at dusk (ref H2); also age-gate poster | nano_banana_pro | 16:9 · 2K | 3 | 6 |
| H1p–H4p | Portrait versions (ref each 16:9 pick) | nano_banana_pro | 9:16 · 2K | 2 each | 16 |
| — | Re-roll buffer (6 images) | nano_banana_pro | — | — | 12 |
| **H stills subtotal** | | | | | **52** |

**H4 prompt**
> Macro photograph of a full pint glass of golden beer with a thick, dense, creamy white head, standing on a glossy dark polished wood bar top under a clear glass surface. Fine condensation beads cover the glass; thin streams of tiny bubbles rise through the beer. The beer is backlit so it glows amber-gold. Background: soft warm bokeh of out-of-focus stainless steel fermentation tanks and glowing Edison bulbs. Camera at bar height, centered, symmetrical, shallow depth of field. The bar top is plain dark wood under glass — no bottle caps. + GRADE

**H3 prompt** (reference: H4)
> Same bar, same lighting, same background bokeh and materials as the reference image, but pulled back slightly: a polished brass beer faucet with a blank handle hangs above an empty clean pint glass standing on the same dark glossy bar top. A single thin stream of golden beer has just begun to pour into the glass; the first inch of beer and foam is forming. Soft steam drifts behind; stainless tanks glow gold out of focus. Shallow depth of field, backlit. + GRADE

**H2 prompt** (reference: H3)
> Straight-on, perfectly symmetrical view at dusk of an old red-brick firehouse facade with one large open vehicle bay. The vintage red sectional bay door is fully rolled up into the header. Inside, a glowing brewhouse: polished stainless steel conical fermentation tanks, a copper-accented brew kettle, wisps of steam backlit gold, Edison bulbs hanging from dark ceiling beams, and, deep inside, a dark bar with a brass faucet matching the reference. A wet asphalt apron in front reflects the warm light. Light haze. + GRADE

**H1 prompt** (reference: H2)
> Exactly the same framing, brick facade, wet pavement and dusk light as the reference image, but the heavy red vintage sectional firehouse bay door is fully closed. The door has one horizontal row of small glass panels; warm golden light leaks through that glass row and through the gap at the bottom of the door, spilling across the wet pavement. Nothing inside is visible except glow. The door is completely blank — no numbers, no lettering. Light haze, cinematic, symmetrical. + GRADE

**Portrait prompt** (reference: matching 16:9 pick)
> Recompose the reference image as a vertical 9:16 frame of the same scene: identical materials, lighting and grade, main subject centered, extra headroom and foreground filled naturally. + GRADE

**Hero clips**

| ID | From → to | Model | Res / dur | Est. cr |
|---|---|---|---|---|
| HB | Bake-off: H1→H2 on Kling 4.0 **and** Kling 3.0 Pro | both | 1080p · 5 s | 13.75 |
| HC1 / HC1p | H1→H2 desktop / portrait | kling4_0 | 1080p · 5 s | 10 |
| HC2 / HC2p | H2→H3 desktop / portrait | kling4_0 | 1080p · 5 s | 10 |
| HC3 / HC3p | H3→H4 desktop / portrait | kling4_0 | 1080p · 5 s | 10 |
| — | Re-roll buffer (one retry per clip) | kling4_0 | | 30 |
| **H clips subtotal** | | | | **≈ 74** (≈ 119 if Kling 3.0 Pro wins the bake-off) |

- **HC1:** "Locked-off camera, the heavy firehouse bay door rolls slowly upward, warm golden light and steam spill out across wet pavement, revealing the stainless brewhouse inside." + MOTION
- **HC2:** "Slow steady dolly forward through the open bay and through drifting steam, past glowing stainless tanks, settling on a brass tap faucet as golden beer begins to pour." + MOTION
- **HC3:** "The pour fills a pint glass in slow motion, foam rising and settling into a thick white head, bubbles streaming upward, camera nearly still." + MOTION

Risk: HC2 is a big spatial move (street → bar). If Kling can't hold it, the fallback is a steam "white-out" crossfade in code between the end of HC1 and the start of HC3, so the hero still works.

### P — Pour loops (On Tap background)

Each loop = one still (start frame **and** end frame) + one 8 s Kling 4.0 clip.

| ID | Still prompt | Loop prompt | Est. cr |
|---|---|---|---|
| P1 | Extreme macro of golden beer backlit against pure black; countless fine carbonation bubbles rising in thin vertical streams; glowing gold; glass wall out of frame. + GRADE | "Seamless loop, ends exactly where it began. Carbonation bubbles rise steadily upward through backlit golden beer, extreme macro, black background, constant gentle motion." + MOTION | still 2×2 = 4 · clip 8 |
| P2 | Extreme macro of a dark brown ale in a glass on studio black, nitro-style cascading bubbles drifting downward through the beer, creamy tan head at the top edge. + GRADE | "Seamless loop, ends exactly where it began. Nitro-style cascade: fine bubbles drift steadily downward through dark brown ale, macro, black background." + MOTION | 4 · 8 |
| P3 | Studio-black macro of a steady stream of amber beer pouring into a glass, foam level constant, backlit amber glow. + GRADE | "Seamless loop, ends exactly where it began. A continuous steady stream of amber beer pours into a glass in slow motion, foam level stays constant, black background." + MOTION | 4 · 8 |
| — | Re-roll buffer (one retry per loop) | | 24 |
| **P subtotal** | | | **≈ 60** |

### T — Textures (square, 2K, made tileable in post)

Prompt base for all: "Flat, straight-on orthographic texture photograph that fills the frame edge to edge, even soft diffuse light, no shadows, no vignette, no perspective, seamless tileable surface." + GRADE (minus the people line).

| ID | Subject | Variants | Est. cr |
|---|---|---|---|
| T1 | Aged red brick in running bond with soft, slightly recessed cream-grey mortar joints; subtle soot and wear | 3 | 6 |
| T2 | Brushed stainless steel, fine horizontal grain, faint cool reflections | 3 | 6 |
| T3 | Dark walnut wood grain, oiled hand-finished boards, rich chocolate tones | 3 | 6 |
| T4 | Well-used black chalkboard with faint smudges and chalk dust, no writing | 3 | 6 |
| T5 | Top-down through thick clear glossy glass/epoxy: dense mosaic of hundreds of metal bottle caps laid flat, varied colors (red, gold, silver, black, green, cream), crimped edges, **every cap completely blank — no printing, no logos, no text**, warm light reflections on the glass. *Illustrative only; a real photo slot sits beside it.* | 3 | 6 |
| **T subtotal** | | | **30** |

Post: offset-by-half + seam blend in Python/sharp to make them truly tileable, then WebP + AVIF ≤ 300 KB.

### V — Visit loop

| ID | Prompt | Model | Est. cr |
|---|---|---|---|
| V1 still | Golden-hour view of rolling, layered Pocono mountain ridgelines in eastern Pennsylvania, forested slopes, soft mist pooled in the valleys, warm low sun, no buildings, no roads, no signs. + GRADE | nano_banana_pro 16:9 · 2 variants | 4 |
| V1 loop | "Seamless loop, ends exactly where it began. Mist drifts very slowly through the valleys, light shifts gently, near-static camera with an almost imperceptible drift." + MOTION | kling4_0 1080p · 10 s (start = end frame) | ≈ 10 |
| — | Re-roll buffer | | 10 |
| **V subtotal** | | | **≈ 24** |

### Must-have total

| Block | Kling 4.0 path | Kling 3.0 Pro path |
|---|---|---|
| H stills | 52 | 52 |
| H clips | 74 | 119 |
| P loops | 60 | 84 |
| T textures | 30 | 30 |
| V1 | 24 | 39 |
| **MUST-HAVE TOTAL** | **≈ 240** | **≈ 325** |

Re-roll buffers are included; if first attempts land, real spend will be lower.

---

## 4. NICE-TO-HAVE assets (priced separately)

| ID | Purpose | Model | Est. cr |
|---|---|---|---|
| F1 | Beer Cheese Pretzel Board: garlic twisted pretzel, smoked cheddar, pepper jack, smoked kielbasa, pickles, grapes, candied walnuts, beer cheese, brown mustard on a dark wood board | nano_banana_pro 4:5 · 3 variants | 6 |
| F2 | Birch Beer Float: dark birch beer with vanilla ice cream and foam in a tall glass | nano_banana_pro 4:5 · 3 | 6 |
| F3 | Smoked BBQ Pork Sandwich with beer cheese, a side and a pickle | nano_banana_pro 4:5 · 3 | 6 |
| F4 | Beef Chili Nachos and Cheese | nano_banana_pro 4:5 · 3 | 6 |
| N1 | Night exterior for final CTA: generic red-brick firehouse-style taproom, glowing glass bay doors, string lights, rain-slick lot, no signage (not the real building) | nano_banana_pro 16:9 ×3 + 9:16 ×2 | 10 |
| A1 | Taproom ambience: 10 s sound-on clip "a cozy taproom at night seen only as close-ups of taps and glasses; beer pouring and fizzing, soft indistinct room murmur, gentle glass clinks, no music, no intelligible speech". Video discarded, audio kept and looped. | kling3_0 pro · sound on · 10 s · 2 attempts | 50 |
| U1 | Logo PNG upscale, used only as the potrace source | topaz_image | ≤ 10 (cap) |
| **NICE-TO-HAVE TOTAL** | | | **≈ 94** |

Food prompt base: "Dark, moody editorial food photograph, single warm key light from the side, deep black background, rustic dark wood surface, appetizing and honest, natural portion, shallow depth of field." + GRADE. Every food image is labelled "Illustrative, not the actual dish" and has a swap point for a real photo.

---

## 5. Grand total vs balance

| | Credits |
|---|---|
| Must-have (Kling 4.0 path) | ≈ 240 |
| Must-have (Kling 3.0 Pro path) | ≈ 325 |
| Nice-to-have, all of it | ≈ 94 |
| **Worst case, everything** | **≈ 420** |
| Balance | 1,210 |
| **Left after worst case** | **≈ 790** |

Optional upgrade not counted above: hero clips on Cinema Studio Video 3.0 at 65 cr per 5 s clip (6 clips ≈ 390, plus retries).

---

## 6. Processing targets

- Hero desktop: ~300 WebP frames @1920px, ≤ ~15 MB total; portrait: ~300 WebP @720px; `poster.jpg` each; all-keyframe MP4 fallback (`-g 1`)
- Loops: H.264 MP4 (faststart, no audio) + WebM (VP9), ≤ 2.5 MB each, poster each
- Textures: WebP + AVIF ≤ 300 KB
- Audio (if A1): loudness-normalised, 20–30 s seamless loop, Opus/WebM + AAC fallback, ≤ 400 KB

---

## 7. Generation log

*(Filled in during Phase 0: asset ID, model, final prompt, settings, job ID, credits charged, kept/rejected.)*

| Asset | Model | Settings | Job ID | Credits | Kept? |
|---|---|---|---|---|---|
| — | — | — | — | — | — |
