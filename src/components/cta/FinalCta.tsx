import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { Illustrative } from "@/components/ui/primitives";

/** The last room: the street out front at night. The image is a generic illustration, not the real building. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black">
      <picture>
        <source media="(max-width: 767px)" type="image/avif" srcSet="/img/night-exterior-portrait.avif" />
        <source media="(max-width: 767px)" type="image/webp" srcSet="/img/night-exterior-portrait.webp" />
        <source type="image/avif" srcSet="/img/night-exterior.avif" />
        <img
          src="/img/night-exterior.webp"
          alt="Illustrative render of a brick taproom at night with glowing glass bay doors and string lights over a rain-slick lot. Not a photo of Brix."
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </picture>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/25" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black to-transparent" />

      <div className="wrap pb-[clamp(5rem,12vw,9rem)]">
        <h2 id="final-title" className="gold-leaf t-display text-[clamp(4.4rem,15vw,15rem)] leading-[0.82]">
          The door&rsquo;s
          <br />
          open.
        </h2>
        <p className="t-serif mt-6 text-[clamp(1.9rem,4vw,3.4rem)] text-gold-hi">Come pour one with us.</p>
        <div className="mt-9">
          <TapHandleButton size="lg" />
        </div>
      </div>
      <Illustrative className="absolute bottom-[calc(56px+env(safe-area-inset-bottom)+12px)] right-4 md:bottom-4 md:right-24">
        Illustrative render · not the actual building
      </Illustrative>
    </section>
  );
}
