import type { PlaybackInstruction } from "../player/ChannelPlayer";

export async function loadPlaybackInstruction(
  channelId: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<PlaybackInstruction> {
  const response = await fetchImplementation(
    `/api/channels/${encodeURIComponent(channelId)}/current-program`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load playback instruction (HTTP ${response.status})`,
    );
  }

  const responseBody = (await response.json()) as PlaybackInstruction;

  return responseBody;
}
