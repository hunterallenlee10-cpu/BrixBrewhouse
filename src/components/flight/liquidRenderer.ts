// Canvas 2D liquid for the four flight glasses. Loaded on demand (dynamic import).
// One rAF loop drives every glass; it sleeps while the section is off-screen.

export type Pourable = { liquid: string; foam?: string; haze: number };

// Glass geometry in a 100 x 240 box. 0..60 is air above the rim (for the stream).
const RIM_Y = 62;
const BOTTOM_Y = 222;
const FULL = 0.84; // liquid height as a fraction of the glass when poured
const SETTLED_FOAM = 0.075;

export function glassInterior(p: Path2D | CanvasRenderingContext2D) {
  p.moveTo(17, RIM_Y);
  p.lineTo(83, RIM_Y);
  p.bezierCurveTo(82, 120, 76, 170, 73, 214);
  p.quadraticCurveTo(72.4, BOTTOM_Y, 66, BOTTOM_Y);
  p.lineTo(34, BOTTOM_Y);
  p.quadraticCurveTo(27.6, BOTTOM_Y, 27, 214);
  p.bezierCurveTo(24, 170, 18, 120, 17, RIM_Y);
  p.closePath();
}

type Bubble = { x: number; y: number; r: number; v: number; a: number };

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}
const mix = (a: readonly number[], b: readonly number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c: readonly number[], a = 1) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`;
const lum = (c: readonly number[]) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

class Glass {
  ctx: CanvasRenderingContext2D;
  clip = new Path2D();
  beer: Pourable | null = null;
  level = 0;
  foam = 0;
  stream = 0;
  // animation bookkeeping
  mode: "idle" | "pour" | "drain" = "idle";
  t0 = 0;
  from = { level: 0, foam: 0 };
  bubbles: Bubble[] = [];
  seed = Math.random() * 1000;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    glassInterior(this.clip);
    for (let i = 0; i < 26; i++) this.bubbles.push(this.newBubble(true));
  }

  newBubble(anywhere = false): Bubble {
    return { x: 30 + Math.random() * 40, y: anywhere ? RIM_Y + Math.random() * (BOTTOM_Y - RIM_Y) : BOTTOM_Y - 2, r: 0.5 + Math.random() * 1.1, v: 9 + Math.random() * 20, a: 0.25 + Math.random() * 0.45 };
  }

  pour(b: Pourable, now: number, instant: boolean) {
    this.beer = b;
    if (instant) {
      this.level = FULL;
      this.foam = SETTLED_FOAM;
      this.stream = 0;
      this.mode = "idle";
      return;
    }
    this.mode = "pour";
    this.t0 = now;
    this.level = 0;
    this.foam = 0;
  }

  drain(now: number, instant: boolean) {
    if (instant) {
      this.beer = null;
      this.level = this.foam = this.stream = 0;
      this.mode = "idle";
      return;
    }
    this.mode = "drain";
    this.t0 = now;
    this.from = { level: this.level, foam: this.foam };
  }

  step(now: number, dt: number) {
    const t = (now - this.t0) / 1000;
    if (this.mode === "pour") {
      this.stream = t < 0.15 ? t / 0.15 : t < 1.35 ? 1 : Math.max(0, 1 - (t - 1.35) / 0.25);
      this.level = FULL * easeOut((t - 0.1) / 1.35);
      const peak = 0.17;
      this.foam = t < 1.45 ? peak * easeOut(t / 1.2) : peak + (SETTLED_FOAM - peak) * easeOut((t - 1.45) / 1.3);
      if (t > 2.8) this.mode = "idle";
    } else if (this.mode === "drain") {
      const k = easeOut(t / 0.5);
      this.level = this.from.level * (1 - k);
      this.foam = this.from.foam * (1 - k);
      this.stream = 0;
      if (t > 0.5) {
        this.mode = "idle";
        this.beer = null;
      }
    }
    // bubbles rise through the liquid
    const surface = BOTTOM_Y - this.level * (BOTTOM_Y - RIM_Y);
    for (const b of this.bubbles) {
      b.y -= b.v * dt * (this.mode === "pour" ? 2.2 : 1);
      b.x += Math.sin((now / 1000 + b.r * 9) * 2) * 0.03;
      if (b.y < surface + 1) Object.assign(b, this.newBubble());
    }
  }

  draw(now: number) {
    const { ctx, canvas } = this;
    const sx = canvas.width / 100;
    const sy = canvas.height / 240;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!this.beer || (this.level <= 0.001 && this.stream <= 0.001)) return;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    const base = hexToRgb(this.beer.liquid);
    const dark = lum(base) < 0.2;
    const hi = mix(base, [255, 236, 180], dark ? 0.1 : 0.16);
    const lo = mix(base, [40, 14, 2], dark ? 0.4 : 0.34);
    const foamC = this.beer.foam ? hexToRgb(this.beer.foam) : dark ? [216, 194, 158] : [246, 240, 226];
    const surface = BOTTOM_Y - this.level * (BOTTOM_Y - RIM_Y);
    const T = now / 1000;

    // stream from above the rim to the surface
    if (this.stream > 0.01) {
      const wob = Math.sin(T * 23 + this.seed) * 0.35;
      const g = ctx.createLinearGradient(0, 0, 0, surface);
      g.addColorStop(0, rgb(hi, 0));
      g.addColorStop(0.18, rgb(hi, 0.9 * this.stream));
      g.addColorStop(1, rgb(base, 0.95 * this.stream));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(48.6 + wob, 0);
      ctx.lineTo(51.4 + wob, 0);
      ctx.lineTo(51.1 - wob, surface);
      ctx.lineTo(48.9 - wob, surface);
      ctx.fill();
    }

    ctx.save();
    ctx.clip(this.clip);
    // body of the beer
    const g = ctx.createLinearGradient(0, surface, 0, BOTTOM_Y);
    g.addColorStop(0, rgb(hi));
    g.addColorStop(0.55, rgb(base));
    g.addColorStop(1, rgb(lo));
    ctx.fillStyle = g;
    const wave = this.mode === "pour" ? 1.6 : 0.5;
    ctx.beginPath();
    ctx.moveTo(0, BOTTOM_Y + 4);
    for (let x = 0; x <= 100; x += 5) ctx.lineTo(x, surface + Math.sin(x * 0.18 + T * 4 + this.seed) * wave);
    ctx.lineTo(100, BOTTOM_Y + 4);
    ctx.closePath();
    ctx.fill();

    // haze: soft drifting clouds for wheat and hazy beers
    if (this.beer.haze > 0.05) {
      ctx.globalCompositeOperation = "source-atop";
      for (let i = 0; i < 4; i++) {
        const cx = 50 + Math.sin(T * 0.4 + i * 1.7 + this.seed) * 18;
        const cy = surface + (BOTTOM_Y - surface) * (0.25 + 0.18 * i) + Math.cos(T * 0.3 + i) * 6;
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
        rg.addColorStop(0, rgb(mix(base, [255, 250, 235], 0.55), 0.32 * this.beer.haze));
        rg.addColorStop(1, rgb(base, 0));
        ctx.fillStyle = rg;
        ctx.fillRect(0, surface, 100, BOTTOM_Y - surface);
      }
      ctx.fillStyle = rgb([255, 248, 230], 0.08 * this.beer.haze);
      ctx.fillRect(0, surface, 100, BOTTOM_Y - surface);
      ctx.globalCompositeOperation = "source-over";
    }

    // bubbles
    for (const b of this.bubbles) {
      if (b.y < surface + 2) continue;
      ctx.fillStyle = rgb(dark ? [255, 220, 190] : [255, 252, 238], b.a * (dark ? 0.3 : 0.55));
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // foam head with a bumpy top
    if (this.foam > 0.002) {
      const top = surface - this.foam * (BOTTOM_Y - RIM_Y);
      const fg = ctx.createLinearGradient(0, top, 0, surface + 2);
      fg.addColorStop(0, rgb(mix(foamC, [255, 255, 255], 0.3)));
      fg.addColorStop(1, rgb(mix(foamC, base, 0.25)));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(0, surface + 2);
      for (let x = 0; x <= 100; x += 4) ctx.lineTo(x, top + Math.sin(x * 0.55 + this.seed) * 1.1 + Math.sin(x * 0.21 + T) * 0.6);
      ctx.lineTo(100, surface + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

export class FlightRenderer {
  glasses: Glass[];
  raf = 0;
  last = performance.now();
  running = false;
  reduced: boolean;
  ro: ResizeObserver;

  constructor(canvases: HTMLCanvasElement[], reduced: boolean) {
    this.reduced = reduced;
    this.glasses = canvases.map((c) => new Glass(c));
    this.ro = new ResizeObserver(() => this.resize());
    canvases.forEach((c) => this.ro.observe(c));
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const g of this.glasses) {
      g.canvas.width = Math.max(1, Math.round(g.canvas.clientWidth * dpr));
      g.canvas.height = Math.max(1, Math.round(g.canvas.clientHeight * dpr));
      g.draw(performance.now());
    }
  }

  pour(i: number, b: Pourable, instant = false) {
    this.glasses[i]?.pour(b, performance.now(), instant || this.reduced);
    this.glasses[i]?.draw(performance.now());
  }
  drain(i: number, instant = false) {
    this.glasses[i]?.drain(performance.now(), instant || this.reduced);
    this.glasses[i]?.draw(performance.now());
  }

  setVisible(v: boolean) {
    if (v && !this.running && !this.reduced) {
      this.running = true;
      this.last = performance.now();
      const loop = (now: number) => {
        if (!this.running) return;
        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        for (const g of this.glasses) {
          g.step(now, dt);
          g.draw(now);
        }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } else if (!v && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  destroy() {
    this.setVisible(false);
    this.ro.disconnect();
  }
}
