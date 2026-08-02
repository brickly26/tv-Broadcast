import Hls from "hls.js";

import { attachHlsMedia, type HlsClient } from "./attach-hls-media";

export interface HlsRuntime {
  isSupported(): boolean;
  createClient(): HlsClient;
}

const defaultHlsRuntime: HlsRuntime = {
  isSupported: () => Hls.isSupported(),
  createClient: () => new Hls(),
};

export function attachBrowserPlayback(
  video: HTMLVideoElement,
  manifestUrl: string,
  runtime: HlsRuntime = defaultHlsRuntime,
): () => void {
  if (runtime.isSupported()) {
    return attachHlsMedia({
      video,
      manifestUrl,
      createHlsClient: runtime.createClient,
    });
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = manifestUrl;

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }

  throw new Error("HLS playback is not supported");
}
