// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { attachBrowserPlayback } from "./attach-browser-playback";

describe("attachBrowserPlayback", () => {
  it("uses hls.js when it is supported", () => {
    const video = document.createElement("video");
    const manifestUrl = "/media/channel-1/program-a/index.m3u8";

    const loadSource = vi.fn();
    const attachMedia = vi.fn();
    const destroy = vi.fn();

    const runtime = {
      isSupported: vi.fn(() => true),
      createClient: vi.fn(() => ({
        loadSource,
        attachMedia,
        destroy,
      })),
    };

    const cleanupPlayback = attachBrowserPlayback(video, manifestUrl, runtime);

    expect(runtime.isSupported).toHaveBeenCalledOnce();
    expect(runtime.createClient).toHaveBeenCalledOnce();
    expect(loadSource).toHaveBeenCalledWith(manifestUrl);
    expect(attachMedia).toHaveBeenCalledWith(video);

    cleanupPlayback();

    expect(destroy).toHaveBeenCalledOnce();
  });

  it("uses native HLS when hls.js is not supported", () => {
    const video = document.createElement("video");
    const manifestUrl = "/media/channel-1/program-a/index.m3u8";

    const canPlayType = vi
      .spyOn(video, "canPlayType")
      .mockReturnValue("probably");

    const load = vi.spyOn(video, "load").mockImplementation(() => {});

    const runtime = {
      isSupported: vi.fn(() => false),
      createClient: vi.fn(() => {
        throw new Error("createdClient should not be called");
      }),
    };

    const cleanupPlayback = attachBrowserPlayback(video, manifestUrl, runtime);

    expect(canPlayType).toHaveBeenCalledWith("application/vnd.apple.mpegurl");
    expect(runtime.createClient).not.toHaveBeenCalled();
    expect(video.getAttribute("src")).toBe(manifestUrl);

    cleanupPlayback();

    expect(video.hasAttribute("src")).toBe(false);
    expect(load).toHaveBeenCalledOnce();
  });

  it("throws when neither hls.js nor native HLS is supported", () => {
    const video = document.createElement("video");

    vi.spyOn(video, "canPlayType").mockReturnValue("");

    const runtime = {
      isSupported: vi.fn(() => false),
      createClient: vi.fn(() => {
        throw new Error("createClient should not be called");
      }),
    };

    expect(() => {
      attachBrowserPlayback(
        video,
        "/media/channel-1/program-a/index.m3u8",
        runtime,
      );
    }).toThrow("HLS playback is not supported");
  });
});
