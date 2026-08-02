import { describe, expect, it } from "vitest";

import {
  resolvePublishedSegmentWindow,
  type SegmentedLoopingPlaylist,
} from "./resolve-published-segment-window";

const playbackEpochMs = 1_000_000;

const playlist: SegmentedLoopingPlaylist = {
  playbackEpochMs,
  programs: [
    {
      id: "program-a",
      segments: [
        { id: "a-000", durationMs: 2_000 },
        { id: "a-001", durationMs: 2_000 },
        { id: "a-002", durationMs: 2_000 },
      ],
    },
    {
      id: "program-b",
      segments: [
        { id: "b-000", durationMs: 2_000 },
        { id: "b-001", durationMs: 2_000 },
      ],
    },
  ],
};

describe("resolvePublishedSegmentWindow", () => {
  it("publishes a segment at the exact end of its scheduled interval", () => {
    const result = resolvePublishedSegmentWindow(
      playlist,
      playbackEpochMs + 2_000,
      6,
    );

    expect(result).toEqual({
      firstSequence: 0,
      nextSequence: 1,
      segments: [
        {
          sequence: 0,
          programId: "program-a",
          segmentId: "a-000",
          segmentIndex: 0,
          durationMs: 2_000,
        },
      ],
    });
  });

  it("does not publish a segment before its scheduled interval ends", () => {
    const result = resolvePublishedSegmentWindow(
      playlist,
      playbackEpochMs + 1_999,
      6,
    );

    expect(result).toEqual({
      firstSequence: 0,
      nextSequence: 0,
      segments: [],
    });
  });

  it("keeps only the configured window across program and cycle boundaries", () => {
    const result = resolvePublishedSegmentWindow(
      playlist,
      playbackEpochMs + 14_000,
      6,
    );

    expect(result.firstSequence).toBe(1);
    expect(result.nextSequence).toBe(7);

    expect(
      result.segments.map(
        ({ sequence, programId, segmentId, segmentIndex }) =>
          `${sequence}:${programId}:${segmentId}:${segmentIndex}`,
      ),
    ).toEqual([
      "1:program-a:a-001:1",
      "2:program-a:a-002:2",
      "3:program-b:b-000:0",
      "4:program-b:b-001:1",
      "5:program-a:a-000:0",
      "6:program-a:a-001:1",
    ]);
  });

  it("uses each segment's actual duration when determining publication", () => {
    const variableDurationPlaylist: SegmentedLoopingPlaylist = {
      playbackEpochMs,
      programs: [
        {
          id: "program-a",
          segments: [
            { id: "a-short", durationMs: 1_500 },
            { id: "a-long", durationMs: 2_500 },
          ],
        },
      ],
    };

    const beforeBoundary = resolvePublishedSegmentWindow(
      variableDurationPlaylist,
      playbackEpochMs + 3_999,
      6,
    );

    const atBoundary = resolvePublishedSegmentWindow(
      variableDurationPlaylist,
      playbackEpochMs + 4_000,
      6,
    );

    expect(beforeBoundary.nextSequence).toBe(1);
    expect(beforeBoundary.segments.map(({ segmentId }) => segmentId)).toEqual([
      "a-short",
    ]);

    expect(atBoundary.nextSequence).toBe(2);
    expect(atBoundary.segments.map(({ segmentId }) => segmentId)).toEqual([
      "a-short",
      "a-long",
    ]);
  });

  it("rejects publication before the channel epoch", () => {
    expect(() => {
      resolvePublishedSegmentWindow(playlist, playbackEpochMs - 1, 6);
    }).toThrow("Cannot publish segments before the playback epoch");
  });

  it("rejects a playlist with no programs", () => {
    expect(() => {
      resolvePublishedSegmentWindow(
        {
          playbackEpochMs,
          programs: [],
        },
        playbackEpochMs,
        6,
      );
    }).toThrow("Playlist must contain at least one program");
  });

  it("rejects a program with no segments", () => {
    expect(() => {
      resolvePublishedSegmentWindow(
        {
          playbackEpochMs,
          programs: [
            {
              id: "empty-program",
              segments: [],
            },
          ],
        },
        playbackEpochMs,
        6,
      );
    }).toThrow("Program must contain at least one segment");
  });

  it("rejects non-positive segment duration", () => {
    expect(() => {
      resolvePublishedSegmentWindow(
        {
          playbackEpochMs,
          programs: [
            {
              id: "program-a",
              segments: [{ id: "invalid", durationMs: 0 }],
            },
          ],
        },
        playbackEpochMs,
        6,
      );
    }).toThrow("Segment duration must be greater than zero");
  });

  it.each([0, -1, 1.5])(
    "rejects invalid window size %s",
    (windowSizeSegments) => {
      expect(() => {
        resolvePublishedSegmentWindow(
          playlist,
          playbackEpochMs,
          windowSizeSegments,
        );
      }).toThrow("Window size must be a positive integer");
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid segment duration %s",
    (durationMs) => {
      expect(() => {
        resolvePublishedSegmentWindow(
          {
            playbackEpochMs,
            programs: [
              {
                id: "program-a",
                segments: [{ id: "invalid", durationMs }],
              },
            ],
          },
          playbackEpochMs,
          6,
        );
      }).toThrow("Segment duration must be greater than zero");
    },
  );
});
