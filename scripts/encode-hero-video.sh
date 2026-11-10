#!/bin/bash
# Encode the hero frame sequence -> public/video/hero-{desktop,mobile}.{mp4,webm} (silent background loop)
set -e
enc() { # kind width
  kind=$1; w=$2; src="public/frames/$kind/f_%04d.webp"
  for crf in 24 27 30 33; do
    ffmpeg -loglevel error -y -framerate 18 -i "$src" -an -vf "scale=$w:-2:flags=lanczos,format=yuv420p" \
      -c:v libx264 -preset slow -crf $crf -profile:v high -r 18 -movflags +faststart public/video/hero-$kind.mp4
    [ $(stat -c%s public/video/hero-$kind.mp4) -le 4000000 ] && break
  done
  for crf in 36 40 44 48; do
    ffmpeg -loglevel error -y -framerate 18 -i "$src" -an -vf "scale=$w:-2:flags=lanczos" \
      -c:v libvpx-vp9 -b:v 0 -crf $crf -row-mt 1 -deadline good -cpu-used 2 public/video/hero-$kind.webm
    [ $(stat -c%s public/video/hero-$kind.webm) -le 4000000 ] && break
  done
  echo "$kind mp4 $(( $(stat -c%s public/video/hero-$kind.mp4)/1024 ))KB webm $(( $(stat -c%s public/video/hero-$kind.webm)/1024 ))KB"
}
enc desktop 1600
enc mobile 720
