#!/bin/bash
# Encode raw loop clips -> public/video/{name}.mp4 + .webm + -poster.jpg (<= 2.5 MB each, silent)
set -e
enc() { # name src seconds width
  n=$1; src=$2; t=$3; w=$4
  for crf in 26 29 32 35; do
    ffmpeg -loglevel error -y -i "$src" -t "$t" -an -vf "scale=$w:-2,fps=24,format=yuv420p" \
      -c:v libx264 -preset slow -crf $crf -profile:v high -movflags +faststart public/video/$n.mp4
    [ $(stat -c%s public/video/$n.mp4) -le 2500000 ] && break
  done
  for crf in 38 42 46 50; do
    ffmpeg -loglevel error -y -i "$src" -t "$t" -an -vf "scale=$w:-2,fps=24" \
      -c:v libvpx-vp9 -b:v 0 -crf $crf -row-mt 1 -deadline good -cpu-used 2 public/video/$n.webm
    [ $(stat -c%s public/video/$n.webm) -le 2500000 ] && break
  done
  ffmpeg -loglevel error -y -i "$src" -frames:v 1 -vf "scale=$w:-2" -q:v 4 public/video/$n-poster.jpg
  echo "$n mp4 $(( $(stat -c%s public/video/$n.mp4)/1024 ))KB webm $(( $(stat -c%s public/video/$n.webm)/1024 ))KB"
}
# trim the final frame (it duplicates frame 0) so the loop has no stutter
enc bubbles assets/raw/P1_loop.mp4 7.96 1280
enc cascade assets/raw/P2_loop.mp4 7.96 1280
enc pour    assets/raw/P3_loop.mp4 7.96 1280
enc ridge   assets/raw/V1_loop.mp4 9.96 1600
