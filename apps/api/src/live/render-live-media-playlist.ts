import type { PublishedSegmentWindow } from "@tv-broadcast/scheduling";

export function renderLiveMediaPlaylist(
  publishedWindow: PublishedSegmentWindow,
  targetDurationMs: number,
): string {
  const expectedSegmentCount =
    publishedWindow.nextSequence - publishedWindow.firstSequence;

  const containsContiguousSequences =
    publishedWindow.firstSequence >= 0 &&
    publishedWindow.nextSequence >= publishedWindow.firstSequence &&
    publishedWindow.segments.length === expectedSegmentCount &&
    publishedWindow.segments.every(
      (segment, index) =>
        segment.sequence === publishedWindow.firstSequence + index,
    );

  if (!containsContiguousSequences) {
    throw new Error(
      "Published segment window must contain contiguous sequences",
    );
  }

  const targetDurationSeconds = Math.ceil(targetDurationMs / 1_000);

  const lines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-TARGETDURATION:${targetDurationSeconds}`,
    `#EXT-X-MEDIA-SEQUENCE:${publishedWindow.firstSequence}`,
  ];

  let previousProgramId: string | undefined;

  for (const segment of publishedWindow.segments) {
    if (
      previousProgramId !== undefined &&
      segment.programId !== previousProgramId
    ) {
      lines.push("#EXT-X-DISCONTINUITY");
    }

    const durationSeconds = (segment.durationMs / 1_000).toFixed(3);

    lines.push(`#EXTINF:${durationSeconds},`);
    lines.push(`segments/${segment.sequence}.ts`);

    previousProgramId = segment.programId;
  }

  return `${lines.join("\n")}\n`;
}
