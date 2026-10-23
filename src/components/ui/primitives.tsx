import type { CSSProperties, ReactNode } from "react";
import { Camera } from "@phosphor-icons/react/dist/ssr";

/** Stencilled bay marking that opens each room: "BAY 03 / THE BAR TOP". */
export function BayLabel({ n, children, className = "", tone = "gold" }: { n: string; children: ReactNode; className?: string; tone?: "gold" | "foam" | "ink" }) {
  const color = tone === "gold" ? "text-gold" : tone === "ink" ? "text-black" : "text-foam";
  return (
    <p className={`flex items-baseline gap-3 ${color} ${className}`}>
      <span className="t-stencil text-[1.35rem] leading-none tracking-[0.12em]">BAY {n}</span>
      <span aria-hidden className="h-px w-8 translate-y-[-0.3em] bg-current opacity-60" />
      <span className="t-mono text-[0.72rem] opacity-90">{children}</span>
    </p>
  );
}

/** Visible marker for any fact the owners still need to confirm. */
export function Confirm({ label, title }: { label?: string; title?: string }) {
  return (
    <span className="confirm" title={title ?? "Owners to confirm"}>
      {label ? <span className="opacity-80">{label}</span> : null}
      {"{{CONFIRM}}"}
    </span>
  );
}

/** Tiny mono caption on every AI-generated visual. */
export function Illustrative({ children = "Illustrative render", className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <span className={`t-mono pointer-events-none select-none text-[0.6875rem] tracking-[0.14em] text-foam/70 ${className}`}>
      {children}
    </span>
  );
}

/** A framed print waiting for a real photo. Brass clips on the corners. */
export function PhotoSlot({
  label,
  note = "Real photo goes here",
  ratio = "4 / 5",
  className = "",
  style,
  tilt = 0,
}: {
  label: string;
  note?: string;
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  tilt?: number;
}) {
  return (
    <figure
      className={`photo-slot relative bg-[#0d0e10] p-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),0_2px_0_rgb(255_255_255/0.04)_inset] ${className}`}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style }}
    >
      <div
        className="relative grid place-items-center overflow-hidden border border-line"
        style={{
          aspectRatio: ratio,
          background:
            "repeating-linear-gradient(135deg, rgb(242 242 242 / 0.025) 0 1px, transparent 1px 14px), radial-gradient(120% 90% at 50% 0%, #1d1e22, #0f1012)",
        }}
      >
        <div className="px-4 text-center">
          <Camera aria-hidden weight="light" className="mx-auto mb-3 h-7 w-7 text-gold/80" />
          <figcaption className="t-mono text-[0.7rem] leading-relaxed text-foam/90">Photo: {label}</figcaption>
          <p className="mt-1 text-[0.75rem] text-text-2">{note}</p>
        </div>
      </div>
      {/* brass corner clips */}
      {["-left-1 -top-1", "-right-1 -top-1 rotate-90", "-bottom-1 -right-1 rotate-180", "-bottom-1 -left-1 -rotate-90"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute h-5 w-5 ${pos}`}
          style={{
            background: "linear-gradient(135deg,#f3d48a,#b98a2c 45%,#6f4f15)",
            clipPath: "polygon(0 0,100% 0,100% 28%,28% 28%,28% 100%,0 100%)",
            filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.6))",
          }}
        />
      ))}
    </figure>
  );
}
