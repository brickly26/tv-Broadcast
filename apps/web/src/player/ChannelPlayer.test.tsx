// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChannelPlayer } from "./ChannelPlayer";

afterEach(cleanup);

describe("ChannelPlayer", () => {
  it("shows a tuning status while playback instructions load", () => {
    const loadPlaybackInstruction = vi.fn(() => new Promise<never>(() => {}));

    render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={vi.fn(() => vi.fn())}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Tuning Channel 1");
    expect(loadPlaybackInstruction).toHaveBeenCalledWith("channel-1");
  });

  it("shows a channel video after playback instructions load", async () => {
    const loadPlaybackInstruction = vi.fn().mockResolvedValue({
      channelId: "channel-1",
      serverTimeMs: 1_767_268_825_000,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    });

    render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={vi.fn(() => vi.fn())}
      />,
    );

    const video = await screen.findByLabelText("Channel 1");

    expect(video.tagName).toBe("VIDEO");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an error when playback instructions fail to load", async () => {
    const loadPlaybackInstruction = vi
      .fn()
      .mockRejectedValue(new Error("Network unavailable"));

    render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={vi.fn(() => vi.fn())}
      />,
    );

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Unable to tune Channel 1");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Channel 1")).not.toBeInTheDocument();
  });

  it("attaches the resolved manifest to the channel video", async () => {
    const playbackInstructions = {
      channelId: "channel-1",
      serverTimeMs: 1_767_268_825_000,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    };

    const loadPlaybackInstruction = vi
      .fn()
      .mockResolvedValue(playbackInstructions);

    const attachPlayback = vi.fn(() => vi.fn());

    render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={attachPlayback}
      />,
    );

    const video = await screen.findByLabelText("Channel 1");

    await waitFor(() => {
      expect(attachPlayback).toHaveBeenCalledWith(
        video,
        playbackInstructions.manifestUrl,
      );
    });
  });

  it("cleans up attached playback when the player unmounts", async () => {
    const playbackInstructions = {
      channelId: "channel-1",
      serverTimeMs: 1_767_268_825_000,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    };

    const loadPlaybackInstruction = vi
      .fn()
      .mockResolvedValue(playbackInstructions);

    const cleanupPlayback = vi.fn();
    const attachPlayback = vi.fn(() => cleanupPlayback);

    const { unmount } = render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={attachPlayback}
      />,
    );

    const video = await screen.findByLabelText("Channel 1");
    unmount();

    await waitFor(() => {
      expect(attachPlayback).toHaveBeenCalledWith(
        video,
        playbackInstructions.manifestUrl,
      );
    });

    expect(cleanupPlayback).toHaveBeenCalledOnce();
  });

  it("shows an error when browser playbac cannot attach", async () => {
    const loadPlaybackInstruction = vi.fn().mockResolvedValue({
      channelId: "channel-1",
      serverTimeMs: 1_767_268_825_000,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25_000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    });

    const attachPlayback = vi.fn(() => {
      throw new Error("HLS playback is not supported");
    });

    render(
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={attachPlayback}
      />,
    );

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Unable to tune Channel 1");
    expect(screen.queryByLabelText("Channel 1")).not.toBeInTheDocument();
  });
});
