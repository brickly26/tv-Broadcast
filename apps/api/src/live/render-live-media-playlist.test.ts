import { describe, expect, it } from "vitest";

import type { PublishedSegmentWindow } from "@tv-broadcast/scheduling";

import { renderLiveMediaPlaylist } from "./render-live-media-playlist";

describe("renderLiveMediaPlaylist", () => {
  it("renders a rolling HLS playlist using only public channel sequences", () => {
    const publishedWindow: PublishedSegmentWindow = {
      firstSequence: 10,
      nextSequence: 12,
      segments: [
        {
          sequence: 10,
          programId: "program-a",
          segmentId: "private-a-010",
          segmentIndex: 10,
          durationMs: 2_000,
        },
        {
          sequence: 11,
          programId: "program-a",
          segmentId: "private-a-011",
          segmentIndex: 11,
          durationMs: 2_000,
        },
      ],
    };

    const manifest = renderLiveMediaPlaylist(publishedWindow, 2_000);

    expect(manifest).toBe(
      [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "#EXT-X-TARGETDURATION:2",
        "#EXT-X-MEDIA-SEQUENCE:10",
        "#EXTINF:2.000,",
        "segments/10.ts",
        "#EXTINF:2.000,",
        "segments/11.ts",
        "",
      ].join("\n"),
    );
  });

  it("does not expose private media identifiers or future sequences", () => {
    const publishedWindow: PublishedSegmentWindow = {
      firstSequence: 10,
      nextSequence: 12,
      segments: [
        {
          sequence: 10,
          programId: "secret-program",
          segmentId: "private-storage-key",
          segmentIndex: 0,
          durationMs: 2_000,
        },
        {
          sequence: 11,
          programId: "secret-program",
          segmentId: "another-private-key",
          segmentIndex: 1,
          durationMs: 2_000,
        },
      ],
    };

    const manifest = renderLiveMediaPlaylist(publishedWindow, 2_000);

    expect(manifest).not.toContain("secret-program");
    expect(manifest).not.toContain("private-storage-key");
    expect(manifest).not.toContain("another-private-key");
    expect(manifest).not.toContain("segments/12.ts");
    expect(manifest).not.toContain("#EXT-X-ENDLIST");
    expect(manifest).not.toContain("#EXT-X-PLAYLIST-TYPE:VOD");
  });

  it("rounds target duration up while preserving the actual segment duration", () => {
    const publishedWindow: PublishedSegmentWindow = {
      firstSequence: 20,
      nextSequence: 21,
      segments: [
        {
          sequence: 20,
          programId: "program-a",
          segmentId: "private-a-020",
          segmentIndex: 0,
          durationMs: 2_500,
        },
      ],
    };

    const manifest = renderLiveMediaPlaylist(publishedWindow, 2_500);

    expect(manifest).toContain("#EXT-X-TARGETDURATION:3");
    expect(manifest).toContain("#EXTINF:2.500,");
  });

  it("adds a discontinuity when the program changes", () => {
    const publishedWindow: PublishedSegmentWindow = {
      firstSequence: 20,
      nextSequence: 22,
      segments: [
        {
          sequence: 20,
          programId: "program-a",
          segmentId: "private-a-020",
          segmentIndex: 29,
          durationMs: 2_000,
        },
        {
          sequence: 21,
          programId: "program-b",
          segmentId: "private-b-000",
          segmentIndex: 0,
          durationMs: 2_000,
        },
      ],
    };

    const manifest = renderLiveMediaPlaylist(publishedWindow, 2_000);

    expect(manifest).toContain(
      [
        "segments/20.ts",
        "#EXT-X-DISCONTINUITY",
        "#EXTINF:2.000,",
        "segments/21.ts",
      ].join("\n"),
    );
  });

  it("rejects a window containing noncontiguous or unpublished sequences", () => {
    const invalidWindow: PublishedSegmentWindow = {
      firstSequence: 20,
      nextSequence: 22,
      segments: [
        {
          sequence: 20,
          programId: "program-a",
          segmentId: "private-a-020",
          segmentIndex: 0,
          durationMs: 2_000,
        },
        {
          sequence: 22,
          programId: "program-a",
          segmentId: "private-a-022",
          segmentIndex: 2,
          durationMs: 2_000,
        },
      ],
    };

    expect(() => {
      renderLiveMediaPlaylist(invalidWindow, 2_000);
    }).toThrow("Published segment window must contain contiguous sequences");
  });
});
