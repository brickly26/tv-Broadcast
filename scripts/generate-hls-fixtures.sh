#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "${script_dir}/.." && pwd)"
fixture_root="${project_root}/fixtures/hls/channel-1"

command -v ffmpeg >/dev/null || {
  echo "ffmpeg is required but was not found"
  exit 1
}

generate_fixture() {
  local output_dir="$1"
  local label="$2"
  local color="$3"
  local duration_seconds="$4"
  local tone_frequency="$5"

  mkdir -p "${output_dir}"

  echo "Generating ${label}..."

  ffmpeg \
    -hide_banner \
    -y \
    -f lavfi -i "color=c=${color}:size=640x360:rate=30:duration=${duration_seconds}" \
    -f lavfi -i "sine=frequency=${tone_frequency}:sample_rate=48000:duration=${duration_seconds}" \
    -vf "drawtext=text='${label}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h/3,drawtext=text='%{pts\\:hms}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h/2" \
    -c:v libx264 -preset veryfast -pix_fmt yuv420p \
    -g 60 -keyint_min 60 -sc_threshold 0 \
    -c:a aac -b:a 128k -ar 48000 \
    -shortest \
    -hls_time 2 \
    -hls_playlist_type vod \
    -hls_segment_filename "${output_dir}/segment-%03d.ts" \
    "${output_dir}/index.m3u8"
}

generate_fixture \
  "${fixture_root}/program-a" \
  "PROGRAM A" \
  "0x7A1F1F" \
  "60" \
  "440"

generate_fixture \
  "${fixture_root}/program-b" \
  "PROGRAM B" \
  "0x1F3A7A" \
  "30" \
  "660"

echo "HLS fixtures generated in ${fixture_root}"
