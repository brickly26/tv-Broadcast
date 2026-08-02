// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { attachHlsMedia } from "./attach-hls-media";

describe("attachHlsMedia", () => {
  it("loads the manifest and attaches it to the video", () => {
    const video = document.createElement("video");
    const manifestUrl = "/media/channel-1/program-a/index.m3u8";

    const loadSource = vi.fn();
    const attachMedia = vi.fn();
    const destroy = vi.fn();

    const createHlsClient = vi.fn(() => ({
      loadSource,
      attachMedia,
      destroy,
    }));

    attachHlsMedia({
      video,
      manifestUrl,
      createHlsClient,
    });

    expect(createHlsClient).toHaveBeenCalledOnce();
    expect(loadSource).toHaveBeenCalledWith(manifestUrl);
    expect(attachMedia).toHaveBeenCalledWith(video);
  });

  it("destroys the HLS client when playback cleanup runs", () => {
    const video = document.createElement("video");
    const destroy = vi.fn();

    const createHlsClient = vi.fn(() => ({
      loadSource: vi.fn(),
      attachMedia: vi.fn(),
      destroy,
    }));

    const cleanupPlayback = attachHlsMedia({
      video,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
      createHlsClient,
    });

    expect(destroy).not.toHaveBeenCalled();

    cleanupPlayback();

    expect(destroy).toHaveBeenCalledOnce();
  });
});
