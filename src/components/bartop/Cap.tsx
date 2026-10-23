"use client";

import { Confirm } from "@/components/ui/primitives";
import type { CapStory } from "./stories";

function CapPhoto({ name }: { name: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`/img/caps/cap-${name}.avif`} />
      <img src={`/img/caps/cap-${name}.webp`} alt="" width={480} height={480} loading="lazy" decoding="async" draggable={false} className="bt-photo" />
    </picture>
  );
}

/**
 * One highlighted cap under the glass. A real button: hover (fine pointers),
 * click, tap, Enter or Space flips it to the liner side, where the story is logged.
 * The full story is always in the accessible name, so nobody has to flip to read it.
 */
export function Cap({
  story,
  index,
  flipped,
  onToggle,
}: {
  story: CapStory;
  index: number;
  flipped: boolean;
  onToggle: () => void;
}) {
  const c = story.color;
  const long = story.figure.length > 3;
  return (
    <button
      type="button"
      data-cursor="cap"
      aria-pressed={flipped}
      onClick={onToggle}
      className="bt-cap"
      style={{ "--i": index } as React.CSSProperties}
    >
      <span className="sr-only">
        {story.figure} {story.unit}: {story.story}
        {story.confirm ? " (year still to be confirmed by the owners)" : ""}
      </span>
      <span aria-hidden className="bt-ring" />
      <span aria-hidden className="bt-inner">
        {/* face: the cap as it sits in the bar top */}
        <span className={`bt-face bt-front`}>
          <CapPhoto name={story.img} />
          <span className="bt-stamp" style={{ color: c.ink }}>
            <span className={`t-stencil ${long ? "bt-figLong" : "bt-fig"}`}>{story.figure}</span>
            <span className={`t-mono bt-unit`}>{story.unit}</span>
            {story.confirm ? (
              <span className="bt-faceConfirm">
                <Confirm />
              </span>
            ) : null}
          </span>
        </span>
        {/* liner side: the story, logged */}
        <span className={`bt-face bt-back`}>
          <CapPhoto name="liner" />
          <span className="bt-linerDisc" />
          <span className="bt-liner">
            <span className={`t-mono bt-log`}>
              Log {String(index + 1).padStart(2, "0")}
            </span>
            <span className="bt-storyText">{story.story}</span>
            <span className={`t-mono bt-credit`}>
              {story.confirm ? <Confirm /> : story.credit}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
