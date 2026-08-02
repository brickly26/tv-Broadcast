export interface HlsClient {
  loadSource(manifestUrl: string): void;
  attachMedia(media: HTMLMediaElement): void;
  destroy(): void;
}

export type CreateHlsClient = () => HlsClient;

export interface AttachHlsMediaOptions {
  readonly video: HTMLVideoElement;
  readonly manifestUrl: string;
  readonly createHlsClient: CreateHlsClient;
}

export function attachHlsMedia({
  video,
  manifestUrl,
  createHlsClient,
}: AttachHlsMediaOptions): () => void {
  const client = createHlsClient();

  client.loadSource(manifestUrl);
  client.attachMedia(video);

  return () => {
    client.destroy();
  };
}
