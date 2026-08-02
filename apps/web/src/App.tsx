import { loadPlaybackInstruction } from "./api/load-playback-instruction";
import { attachBrowserPlayback } from "./playback/attach-browser-playback";
import { ChannelPlayer } from "./player/ChannelPlayer";

export function App() {
  return (
    <main>
      <h1>TV Broadcast</h1>
      <ChannelPlayer
        channelId="channel-1"
        loadPlaybackInstruction={loadPlaybackInstruction}
        attachPlayback={attachBrowserPlayback}
      />
    </main>
  );
}
