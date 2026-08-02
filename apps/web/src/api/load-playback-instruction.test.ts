import { describe, expect, it, vi } from "vitest";

import { loadPlaybackInstruction } from "./load-playback-instruction";

describe("loadPlaybackInstruction", () => {
  it("requests and returns the current playback instruction", async () => {
    const playbackInstruction = {
      channelId: "channel-1",
      serverTimeMs: 1_767_268_825_000,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    };

    const fetchImplementation = vi.fn<typeof fetch>();

    fetchImplementation.mockResolvedValue(
      new Response(JSON.stringify(playbackInstruction), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await loadPlaybackInstruction(
      "channel-1",
      fetchImplementation,
    );

    expect(fetchImplementation).toHaveBeenCalledWith(
      "/api/channels/channel-1/current-program",
      {
        cache: "no-store",
      },
    );

    expect(result).toEqual(playbackInstruction);
  });

  it("rejects when the API returns an unsuccessful response", async () => {
    const fetchImplementation = vi.fn<typeof fetch>();

    fetchImplementation.mockResolvedValue(
      new Response(null, {
        status: 404,
      }),
    );

    await expect(
      loadPlaybackInstruction("missing-channel", fetchImplementation),
    ).rejects.toThrow("Unable to load playback instruction (HTTP 404)");
  });
});
