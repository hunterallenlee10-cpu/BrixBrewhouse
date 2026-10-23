"use client";

import { Confirm } from "@/components/ui/primitives";
import { crimpPath, type CapStory } from "./stories";
import "./bartop.css";

const CRIMP = crimpPath();

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
  const gid = `cap-${story.id}`;
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
          <svg viewBox="0 0 100 100" className="bt-svg">
            <defs>
              <radialGradient id={`${gid}-b`} cx="38%" cy="32%" r="75%">
                <stop offset="0" stopColor={c.hi} />
                <stop offset="0.45" stopColor={c.base} />
                <stop offset="1" stopColor={c.lo} />
              </radialGradient>
              <radialGradient id={`${gid}-d`} cx="42%" cy="36%" r="70%">
                <stop offset="0" stopColor={c.hi} stopOpacity="0.55" />
                <stop offset="0.6" stopColor={c.base} stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={CRIMP} fill={`url(#${gid}-b)`} />
            <circle cx="50" cy="50" r="38.5" fill={c.base} />
            <circle cx="50" cy="50" r="38.5" fill={`url(#${gid}-d)`} />
            <circle cx="50" cy="50" r="38.5" fill="none" stroke={c.lo} strokeOpacity="0.55" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="36.6" fill="none" stroke={c.hi} strokeOpacity="0.35" strokeWidth="0.6" />
            <ellipse cx="38" cy="30" rx="16" ry="7" fill="#fff" opacity="0.18" transform="rotate(-28 38 30)" />
          </svg>
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
          <svg viewBox="0 0 100 100" className="bt-svg">
            <defs>
              <radialGradient id={`${gid}-s`} cx="40%" cy="35%" r="80%">
                <stop offset="0" stopColor="#f4f6f7" />
                <stop offset="0.5" stopColor="#a9aeb3" />
                <stop offset="1" stopColor="#4d5257" />
              </radialGradient>
            </defs>
            <path d={CRIMP} fill={`url(#${gid}-s)`} />
            <circle cx="50" cy="50" r="41" fill="#ece5d6" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#cfc6b4" strokeWidth="0.7" />
          </svg>
          <span className="bt-liner">
            <span className={`t-mono bt-log`}>
              Log {String(index + 1).padStart(2, "0")}
              <br />
              {story.log}
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
