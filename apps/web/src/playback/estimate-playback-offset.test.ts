import { describe, expect, it } from "vitest";

import { estimatePlaybackOffsetMs } from "./estimate-playback-offset";

describe("estimatePlaybackOffsetMs", () => {
  it("advances the resolved offset for network and media-loading time", () => {
    const result = estimatePlaybackOffsetMs({
      resolvedOffsetMs: 25_000,
      roundTripMs: 200,
      elapsedSinceResponseMs: 400,
    });

    expect(result).toBe(25_500);
  });
});
