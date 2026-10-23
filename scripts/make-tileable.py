"""Make square textures tileable. Usage: python3 -I scripts/make-tileable.py in.png out.png [--period]
--period: find the repeat period by autocorrelation and crop to a whole number of repeats (brick).
default: feathered half-offset blend (organic surfaces: wood, steel, chalk, caps)."""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
H, W, _ = im.shape

if "--period" in sys.argv:
    g = im.mean(2)
    g = g - g.mean()
    def period(sig, lo, hi):
        f = np.fft.rfft(sig - sig.mean())
        ac = np.fft.irfft(f * np.conj(f))
        return lo + int(np.argmax(ac[lo:hi]))
    # mortar rows: average across x; brick courses repeat every 2 rows (running bond)
    py = period(g.mean(1), 40, 400)
    px = period(g.mean(0), 40, 600)
    ny = max(1, int((H * 0.9) // py)); nx = max(1, int((W * 0.9) // px))
    ny -= ny % 2  # running bond needs an even number of courses
    ch, cw = py * ny, px * nx
    y0 = (H - ch) // 2; x0 = (W - cw) // 2
    out = im[y0:y0 + ch, x0:x0 + cw]
    print("period", py, px, "crop", ch, cw)
else:
    off = np.roll(np.roll(im, H // 2, 0), W // 2, 1)
    yy = np.abs(np.linspace(-1, 1, H))[:, None]
    xx = np.abs(np.linspace(-1, 1, W))[None, :]
    d = np.maximum(yy, xx)  # 0 centre -> 1 edge
    w = np.clip((1 - d) / 0.35, 0, 1) ** 1.5  # 1 in centre, fades to 0 near edges
    out = im * w[..., None] + off * (1 - w[..., None])
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst)
