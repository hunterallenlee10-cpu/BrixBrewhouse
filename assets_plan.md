# Brix Brewhouse — Higgsfield Asset Plan

**Status: approved 2026-10-23 and generated. Phase 0 spend: ≈ 235 credits (see log).**
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

All jobs ran on 2026-10-23. Job records report the image model as `nano_banana_2` even though `nano_banana_pro` was requested; transactions bill them as "Nano Banana Pro" at 2 cr. Kling 4.0 won the bake-off against Kling 3.0 Pro (smoother final settle, 5 cr vs 8.75), so all hero clips and loops use Kling 4.0.

> Account note: during this session the account balance also dropped by ≈ 153 credits from jobs this session did **not** submit (Bytedance Image Upscale, Nano Banana 2.1, three Kling v3.0 jobs at 17.5/17.5/7.5, Kling 4.0 at 2.5 and 10). Something else is using the same Higgsfield account. Balance after Phase 0: 821.75.

### Kept assets

| Asset | File(s) on site | Source job | Model / settings | Cr |
|---|---|---|---|---|
| H4 pint (16:9) | hero frames end, `/img/pint-h4` | 18153a7e-4231-4488-831f-1d159d0caf00 | nano_banana_pro 2K | 2 |
| H3 tap pour (16:9, ref H4) | hero frames | 55798b0e-cc3f-4a66-9584-37e44b21b1d5 | nano_banana_pro 2K + ref | 2 |
| H2 open bay (16:9, ref H3) | hero frames | 79813efd-2f80-4c88-9b11-bb7368cacc85 | nano_banana_pro 2K + ref | 2 |
| H1 closed door (16:9, ref H2) | gate + hero poster | 7bc19dc4-5a33-4eca-986d-f28902703e0f | nano_banana_pro 2K + ref | 2 |
| H4p / H3p / H2p / H1p (9:16) | mobile hero frames | 5809d64c… / 4236f789… / 4498c41e… / d066d291-dc4b-48be-b505-0e86885e906d | nano_banana_pro 2K + ref | 8 |
| HC1 door opens (16:9) | `/frames/desktop` 1-90 | 46554bb1-b12e-4f98-b1ea-ad3e4abf75c3 | kling4_0 i2v 1080p 5s, start H1 end H2 | 5 |
| HC2 dolly (16:9) | `/frames/desktop` 91-180 | 9aefeffd-fefb-482a-a113-f26d0945ff4e | kling4_0 i2v 1080p 5s, start H2 end H3 | 5 |
| HC3 pour fills (16:9) | `/frames/desktop` 181-271 | ae0a361d-4b3e-474f-9556-4ea4184c7b19 | kling4_0 i2v 1080p 5s, start H3 end H4 | 5 |
| HC1p / HC2p / HC3p (9:16) | `/frames/mobile` | c81f4cf2-2479-4390-a8db-1514572e873f / 7c8c46c9-e133-4ef1-bf56-68254628aedc / 6c63397a-5ab3-4ea3-bf3c-29aed67081ee | kling4_0 i2v 1080p 5s | 15 |
| P1 bubbles | `/video/bubbles.*` | still 99b1af8b…, loop 49d5a1d9-ad79-4b10-9938-2cd2eb43c935 | kling4_0 8s, start = end frame | 2 + 8 |
| P2 cascade | `/video/cascade.*` | still 6b522331…, loop 46434209-89a6-45f8-8634-c246ecd46005 | kling4_0 8s, start = end | 2 + 8 |
| P3 pour | `/video/pour.*` | still 3ed23cc2…, loop 10d81b44-5563-4527-8552-cfc9e367310e | kling4_0 8s, start = end | 2 + 8 |
| V1 Pocono ridge | `/video/ridge.*` | still c8c1c0a0…, loop 156487c5-a944-488a-8c69-55815a572624 | kling4_0 10s, start = end | 2 + 10 |
| T1 brick (tileable, period crop) | `/tex/brick.*` | d2296869-1f05-46fc-b19d-e30ce2f4d97a | nano_banana_pro 2K 1:1 | 2 |
| T2 stainless (tileable) | `/tex/stainless.*` | 8f386bb6-19c7-4589-a4d4-630f48dacac4 | nano_banana_pro 2K | 2 |
| T3 walnut (cover only) | `/tex/walnut.*` | 22b157dc-9def-4226-8e60-e6585a7d7ef9 | nano_banana_pro 2K | 2 |
| T4 chalkboard (tileable) | `/tex/chalk.*` | 611c29ec-ba32-4d87-8a16-b7cb8437e5cf | nano_banana_pro 2K | 2 |
| T5 caps under glass (cover only) | `/tex/caps.*` | 3098c647-154f-4996-a783-8f80e0e883fb | nano_banana_pro 2K | 2 |
| F1-F4 food | `/img/food-*` | a4b02d51… / 3599869a… / 405476d0… / 029be1d8… | nano_banana_pro 2K 4:5 | 8 |
| N1 night exterior | `/img/night-exterior*` | 0b056841… (16:9), 6ce13bb4… (9:16) | nano_banana_pro 2K | 4 |
| C1-C6 bottle caps, top-down (1:1) | `/img/caps/cap-{red,gold,silver,green,gunmetal,cream}.*` | 0a36f709-85b7-4cc4-9ee8-d1f7667623fb / a8b213f5-aac9-485a-9349-21cbd548fa94 / f0ad2c44-6777-485e-a242-9ea72e47f2c3 / d6a50e9a-9954-4f8c-bfef-b0f337f31059 / 7126229e-bd38-4fbc-b3cd-b15eff7a5881 / d132fa64-7952-42cc-ae8e-1fd4359f566a | nano_banana_pro 2K, blank caps (no printing) | 12 |
| C7 cap underside (liner) | `/img/caps/cap-liner.*` | f0fff0d4-b053-4f30-adfc-ba30a750178f | nano_banana_pro 2K 1:1 | 2 |
| T6 maple shuffleboard (cover only) | `/tex/maple.*` | 4aaf7d30-0e89-4684-a827-634eb74a1586 | nano_banana_pro 2K 21:9 | 2 |
| T7 newsprint (cover only) | `/tex/newsprint.*` | 26f7c3c4-e063-447a-ad02-ad9de2f5a000 | nano_banana_pro 2K 1:1 | 2 |
| A1 taproom audio | `/audio/taproom.*` | 6fac8429-f1c8-41ce-a793-f08951c5ee62 | kling3_0 pro 10s sound on; video discarded, audio low-passed at 2.8 kHz (no intelligible speech), forward+reverse crossfade loop, -30 LUFS | 25 |

### Rejected drafts (paid, not shipped)

H4 a/c, H3 a/c, H2 a/c, H1 a/b, H4p a, H3p a, H2p b, H1p b, T1 b, T2 b, T3 a (two-tone band), T4 b, T5 a (perspective), P1 a, P2 b, P3 b, V1 a, F1 b, F2 b, F3 b, F4 b, N1 b (five doors: too close to the real building), N1 c; Kling 3.0 Pro HC3 bake-off clip (1cc7208d…); A1 a (0fcc254c…). Total for rejects ≈ 82 cr.

### Processing notes

- Hero: 3 clips per orientation joined at 18 fps, duplicate seam frames dropped → 271 frames each. Desktop 1920×1072 WebP q44 = 15.2 MiB; mobile 720×1290 WebP q42 = 8.4 MiB. Posters, final frames and all-keyframe MP4 fallbacks (1280w, `-g 1`) beside them.
- Loops: last frame trimmed (it duplicates frame 0); H.264 + VP9 all ≤ 2.4 MB.
- Textures: brick tiles by its measured period (129 × 293 px); stainless and chalk by feathered half-offset blend; caps and walnut ghosted under blending, so they ship as cover images instead.
- Finish-review pass (2026-10-23, +18 cr, all 9 kept): caps cut out of their studio backgrounds by `scripts/cut-caps.py` (outline traced ray by ray from the centre, narrow dropouts closed, 1px feather) → 480 px alpha WebP/AVIF, 15-47 KB each. Maple and newsprint ship as cover images; the clippings' torn bottom edge is a generated SVG mask (`scripts/make-torn-edge.mjs`).
- U1 (logo upscale) skipped: the original PNG traced cleanly (0.03% silhouette mismatch), so no upscale was needed.
