import type { CSSProperties, ReactNode } from "react";
import { Camera } from "@phosphor-icons/react/dist/ssr";

/** Stencilled bay marking that opens each room: "BAY 03 / THE BAR TOP". */
export function BayLabel({ n, children, className = "", tone = "gold" }: { n: string; children: ReactNode; className?: string; tone?: "gold" | "foam" | "ink" }) {
  const color = tone === "gold" ? "text-gold" : tone === "ink" ? "text-black" : "text-foam";
  return (
    <p className={`flex items-baseline gap-3 ${color} ${className}`}>
      <span className="t-stencil text-[clamp(1.7rem,2.4vw,2.25rem)] leading-none tracking-[0.1em]">BAY {n}</span>
      <span aria-hidden className="h-px w-8 translate-y-[-0.3em] bg-current opacity-60" />
      <span className="t-mono text-[0.72rem] opacity-90">{children}</span>
    </p>
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

/**
 * A real photo for a PhotoSlot. `src` has no extension: .avif + .webp sit side by side.
 * `position` is the object-position; `phonePosition` overrides it below 768px,
 * where the prints are small and the caption covers more of them.
 */
export type SlotPhoto = { src: string; alt: string; width: number; height: number; position?: string; phonePosition?: string };

/**
 * A framed print. Brass clips on the corners. Without `photos` it is a
 * placeholder waiting for a real photo; with them, the photos fill the print
 * (several sit side by side) and the caption sits over one edge.
 */
export function PhotoSlot({
  label,
  note,
  ratio = "4 / 5",
  className = "",
  style,
  tilt = 0,
  photos,
  captionAt = "bottom",
}: {
  label: string;
  note?: string;
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  tilt?: number;
  photos?: SlotPhoto[];
  /** where the caption sits over the photos, so it can stay off the subject */
  captionAt?: "top" | "bottom";
}) {
  const hasPhotos = !!photos?.length;
  const shownNote = note ?? (hasPhotos ? undefined : "Real photo goes here");
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
        {hasPhotos ? (
          <>
            <div className="absolute inset-0 flex gap-[3px] bg-[#0d0e10]">
              {photos!.map((ph) => (
                <picture key={ph.src} className="relative min-w-0 flex-1">
                  <source srcSet={`${ph.src}.avif`} type="image/avif" />
                  <img
                    src={`${ph.src}.webp`}
                    alt={ph.alt}
                    width={ph.width}
                    height={ph.height}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover [object-position:var(--pos-phone)] md:[object-position:var(--pos)]"
                    style={{ "--pos": ph.position ?? "50% 50%", "--pos-phone": ph.phonePosition ?? ph.position ?? "50% 50%" } as CSSProperties}
                  />
                </picture>
              ))}
            </div>
            <div
              className={`absolute inset-x-0 from-black/75 via-black/35 to-transparent px-3 text-center [text-shadow:0_1px_4px_rgb(0_0_0/0.9)] ${
                captionAt === "top" ? "top-0 bg-gradient-to-b pb-8 pt-2.5" : "bottom-0 bg-gradient-to-t pb-2.5 pt-8"
              }`}
            >
              <figcaption className="t-mono text-[0.7rem] leading-relaxed text-foam/90">Photo: {label}</figcaption>
              {shownNote ? <p className="mt-1 text-[0.75rem] text-text-2">{shownNote}</p> : null}
            </div>
          </>
        ) : (
          <div className="px-4 text-center">
            <Camera aria-hidden weight="light" className="mx-auto mb-3 h-7 w-7 text-gold/80" />
            <figcaption className="t-mono text-[0.7rem] leading-relaxed text-foam/90">Photo: {label}</figcaption>
            <p className="mt-1 text-[0.75rem] text-text-2">{shownNote}</p>
          </div>
        )}
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
