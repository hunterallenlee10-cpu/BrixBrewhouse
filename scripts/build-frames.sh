#!/bin/bash
# Join the three hero clips and cut a WebP frame sequence + poster + all-keyframe MP4 fallback.
# usage: build-frames.sh <desktop|mobile> <width> <quality> clip1 clip2 clip3
set -e
kind=$1; w=$2; q=$3; shift 3
out=public/frames/$kind; tmp=$(mktemp -d)
rm -rf "$out"; mkdir -p "$out"
i=0
for c in "$@"; do
  # FPS (default 18) per clip; drop each later clip's first frame (it duplicates the previous clip's last)
  start=0; [ $i -gt 0 ] && start=0.05
  ffmpeg -loglevel error -y -ss $start -i "$c" -vf "fps=${FPS:-18},scale=$w:-2:flags=lanczos" -an "$tmp/c$i.mp4" -c:v libx264 -crf 12 -preset fast
  i=$((i+1))
done
printf "file '%s'\n" "$tmp"/c*.mp4 > "$tmp/list.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/list.txt" -c copy "$tmp/all.mp4"
ffmpeg -loglevel error -y -i "$tmp/all.mp4" -c:v libwebp -quality $q -compression_level 6 -preset photo "$out/f_%04d.webp"
ffmpeg -loglevel error -y -i "$tmp/all.mp4" -frames:v 1 -q:v 3 "$out/poster.jpg"
ffmpeg -loglevel error -y -sseof -0.1 -i "$tmp/all.mp4" -frames:v 1 -q:v 3 "$out/final.jpg"
ffmpeg -loglevel error -y -i "$tmp/all.mp4" -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -g 1 -crf 34 -preset slow -pix_fmt yuv420p -movflags +faststart "$out/fallback.mp4"
n=$(ls "$out"/f_*.webp | wc -l); size=$(du -cb "$out"/f_*.webp | tail -1 | cut -f1)
dims=$(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$out/poster.jpg")
echo "$kind frames=$n webp_total=$((size/1024/1024))MB dims=$dims"
rm -rf "$tmp"
