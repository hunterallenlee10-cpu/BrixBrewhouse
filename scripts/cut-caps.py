"""Cut the generated bottle caps out of their studio backgrounds -> square alpha PNGs.
usage: python3 cut-caps.py RAW_DIR OUT_DIR
Foreground = pixels far from the corner background colour; the outline is traced
ray by ray from the centre (caps are star-shaped), then the edge is feathered."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

raw, out = sys.argv[1], sys.argv[2]
NAMES = {"cap0": "cap-red", "cap1": "cap-gold", "cap2": "cap-silver", "cap3": "cap-green",
         "cap4": "cap-gunmetal", "cap5": "cap-cream", "capback": "cap-liner"}
SIZE = 480

for src, dst in NAMES.items():
    im = Image.open(f"{raw}/{src}.png").convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    k = 40
    corners = np.concatenate([a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3), a[-k:, :k].reshape(-1, 3), a[-k:, -k:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    # background varies (gradients, soft shadow): compare to a heavily blurred version too
    diff = np.abs(a - bg).max(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    fg = (diff > 55) | (sat > 70)
    m = Image.fromarray((fg * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    f = np.asarray(m) > 0
    ys, xs = np.where(f)
    rows = np.bincount(ys, minlength=h); cols = np.bincount(xs, minlength=w)
    rr = np.where(rows > rows.max() * 0.05)[0]; cc = np.where(cols > cols.max() * 0.05)[0]
    y0, y1, x0, x1 = rr[0], rr[-1], cc[0], cc[-1]
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    r = max(x1 - x0, y1 - y0) / 2
    # the outline is star-shaped about the centre: walk each ray in from outside
    # and stop at the first cap pixel, so dark enamel inside never punches holes
    N = 2880
    radii = np.zeros(N)
    steps = np.arange(r * 1.04, r * 0.6, -0.5)
    for i in range(N):
        t = 2 * np.pi * i / N
        px = np.clip((cx + steps * np.cos(t)).astype(int), 0, w - 1)
        py = np.clip((cy + steps * np.sin(t)).astype(int), 0, h - 1)
        hit = np.where(f[py, px])[0]
        radii[i] = steps[hit[0]] if len(hit) else r * 0.6
    # close narrow dips (a ray that slipped through a crimp shadow), then a small median.
    # one crimp spans ~N/21 rays, so a 9-ray window never erases real crimp detail
    def circ(fn, x, k):
        pad = np.concatenate([x[-k:], x, x[:k]])
        return np.array([fn(pad[i:i + 2 * k + 1]) for i in range(len(x))])
    radii = circ(np.min, circ(np.max, radii, 4), 4)
    radii = circ(np.median, radii, 3)
    # crimp valleys are only ~3% of the radius deep: anything deeper than the local
    # envelope (a wide median, which follows slightly off-centre caps) is a dropout
    env = circ(np.median, radii, 60)
    radii = np.maximum(radii, env - 0.035 * r)
    pts = [(cx + radii[i] * np.cos(2 * np.pi * i / N), cy + radii[i] * np.sin(2 * np.pi * i / N)) for i in range(N)]
    mm = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mm).polygon(pts, fill=255)
    mask = np.asarray(mm)
    alpha = Image.fromarray(mask).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.copy(); rgba.putalpha(alpha)
    pad = r * 1.015
    box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
    rgba = rgba.crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    rgba.save(f"{out}/{dst}.png")
    print(dst, "r=%.0f" % r, "center=(%.0f,%.0f)" % (cx, cy))
