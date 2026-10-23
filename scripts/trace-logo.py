"""Trace the Brix logo PNG into a 3-layer SVG (charcoal disc, light ink, red).
Run: python3 -I scripts/trace-logo.py public/brand/brix-logo.png public/brand
The mark is traced, never redrawn: each colour layer comes straight from the PNG pixels."""
import sys
import numpy as np
from PIL import Image
import potrace

src, outdir = sys.argv[1], sys.argv[2]
SS = 2  # supersample for smoother curves
im = Image.open(src).convert("RGBA")
W, H = im.size
big = np.array(im.resize((W * SS, H * SS), Image.LANCZOS)).astype(int)
r, g, b, a = big[..., 0], big[..., 1], big[..., 2], big[..., 3]

disc = a > 128
red = disc & (r > 140) & (g < 110) & (b < 130)
light = disc & ~red & (np.minimum(np.minimum(r, g), b) > 140)

def trace(mask):
    bm = potrace.Bitmap(~mask)  # potracer fills the False pixels
    plist = bm.trace(turdsize=8, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                     alphamax=1.0, opticurve=True, opttolerance=0.2)
    parts = []
    f = lambda p: f"{p.x / SS:.1f},{p.y / SS:.1f}"
    for curve in plist:
        parts.append(f"M{f(curve.start_point)}")
        for seg in curve.segments:
            if seg.is_corner:
                parts.append(f"L{f(seg.c)}L{f(seg.end_point)}")
            else:
                parts.append(f"C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}")
        parts.append("Z")
    return "".join(parts)

d_disc, d_light, d_red = trace(disc), trace(light), trace(red)

def svg(fills, title):
    paths = "".join(f'<path fill="{c}" fill-rule="evenodd" d="{d}"/>' for c, d in fills if c)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" '
            f'aria-labelledby="t"><title id="t">{title}</title>{paths}</svg>')

open(f"{outdir}/brix-logo.svg", "w").write(svg(
    [("#2E2E30", d_disc), ("#F4F4F4", d_light), ("#EA0322", d_red)], "Brix Brewhouse"))
# White version: for dark grounds. Disc becomes transparent; light ink + red stay.
open(f"{outdir}/brix-logo-white.svg", "w").write(svg(
    [("#F4F4F4", d_light), ("#EA0322", d_red)], "Brix Brewhouse"))
# Mono white (single colour, e.g. watermark)
open(f"{outdir}/brix-logo-mono.svg", "w").write(svg(
    [("#F4F4F4", d_light + d_red)], "Brix Brewhouse"))
print("ok", len(d_disc), len(d_light), len(d_red))

# Monogram: only the split "B", isolated inside the inner ring (r < 385px from centre).
yy, xx = np.mgrid[0:H * SS, 0:W * SS]
inner = ((xx / SS - W / 2) ** 2 + (yy / SS - H / 2) ** 2 < 385 ** 2) & (xx / SS > 300) & (xx / SS < 900) & (yy / SS > 365) & (yy / SS < 890)
m_light, m_red = trace(light & inner), trace(red & inner)
ys, xs = np.where((light | red) & inner)
x0, x1, y0, y1 = xs.min() / SS, xs.max() / SS, ys.min() / SS, ys.max() / SS
pad = 24
vb = f"{x0 - pad:.0f} {y0 - pad:.0f} {x1 - x0 + 2 * pad:.0f} {y1 - y0 + 2 * pad:.0f}"
open(f"{outdir}/brix-monogram.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="Brix Brewhouse">'
    f'<path fill="#F4F4F4" fill-rule="evenodd" d="{m_light}"/><path fill="#EA0322" fill-rule="evenodd" d="{m_red}"/></svg>')
# Favicon badge: monogram on a charcoal disc
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
R = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5 / 2 + 40
open(f"{outdir}/brix-monogram-badge.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cx - R:.0f} {cy - R:.0f} {2 * R:.0f} {2 * R:.0f}">'
    f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="#111214"/>'
    f'<path fill="#F4F4F4" fill-rule="evenodd" d="{m_light}"/><path fill="#EA0322" fill-rule="evenodd" d="{m_red}"/></svg>')
print("monogram vb", vb)
