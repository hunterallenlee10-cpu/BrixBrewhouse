"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "@phosphor-icons/react";
import "./press.css";

/** Click-to-load YouTube. Nothing from YouTube loads until the visitor asks for it. */
export function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="press-video">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setOn(true)}
          data-cursor="cap"
          aria-label={`Play video: ${title}`}
          className={`press-videoBtn group absolute inset-0 grid place-items-center`}
        >
          <Image
            src="/img/video-poster.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-95"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <span className={`press-play relative`}>
            <Play aria-hidden weight="fill" className="ml-1 h-[38%] w-[38%]" />
          </span>
          <span className="t-mono absolute bottom-4 left-4 text-[0.68rem] text-foam/90 md:bottom-5 md:left-6">
            Plays from YouTube · loads on click
          </span>
        </button>
      )}
    </div>
  );
}
