import { describe, expect, it } from "vitest";

import { resolveCurrentProgram } from "./resolve-current-program";

describe("resolveCurrentProgram", () => {
  const playlist = {
    playbackEpochMs: Date.UTC(2026, 0, 1, 12, 0, 0),
    programs: [
      { id: "program-a", durationMs: 60_000 },
      { id: "program-b", durationMs: 30_000 },
    ],
  };

  it("returns the first program and its elapsed offset while its slot is active", () => {
    const result = resolveCurrentProgram(
      playlist,
      playlist.playbackEpochMs + 25_000,
    );

    expect(result).toEqual({
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
    });
  });

  it("switches to the next program at the exact slot boundary", () => {
    const result = resolveCurrentProgram(
      playlist,
      playlist.playbackEpochMs + 60_000,
    );

    expect(result).toEqual({
      programId: "program-b",
      programIndex: 1,
      offsetMs: 0,
    });
  });

  it("wraps to the beginning after a complete playlist cycle", () => {
    const result = resolveCurrentProgram(
      playlist,
      playlist.playbackEpochMs + 95_000,
    );

    expect(result).toEqual({
      programId: "program-a",
      programIndex: 0,
      offsetMs: 5_000,
    });
  });

  it("rejects an empty playlist", () => {
    const emptyPlaylist = {
      playbackEpochMs: Date.UTC(2026, 0, 1, 12, 0, 0),
      programs: [],
    };

    expect(() => {
      resolveCurrentProgram(emptyPlaylist, emptyPlaylist.playbackEpochMs);
    }).toThrow("Playlist must contain at least one program");
  });

  it("starts the first program at the exact cycle boundary", () => {
    const result = resolveCurrentProgram(
      playlist,
      playlist.playbackEpochMs + 90_000,
    );

    expect(result).toEqual({
      programId: "program-a",
      programIndex: 0,
      offsetMs: 0,
    });
  });

  it("rejects a playlist containing a zero-duration program", () => {
    const zeroDurationPlaylist = {
      playbackEpochMs: Date.UTC(2026, 0, 1, 12, 0, 0),
      programs: [
        { id: "program-a", durationMs: 60_000 },
        { id: "program-b", durationMs: 30_000 },
        { id: "program-c", durationMs: 0 },
      ],
    };

    expect(() => {
      resolveCurrentProgram(
        zeroDurationPlaylist,
        zeroDurationPlaylist.playbackEpochMs,
      );
    }).toThrow("Program durations must be greater than zero");
  });

  it("wraps to the end of the playlist immediately before the playback epoch", () => {
    const result = resolveCurrentProgram(
      playlist,
      playlist.playbackEpochMs - 1,
    );

    expect(result).toEqual({
      programId: "program-b",
      programIndex: 1,
      offsetMs: 29_999,
    });
  });
});
