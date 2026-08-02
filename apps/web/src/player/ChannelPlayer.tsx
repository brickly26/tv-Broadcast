import { useEffect, useRef, useState } from "react";

export interface PlaybackInstruction {
  readonly channelId: string;
  readonly serverTimeMs: number;
  readonly programId: string;
  readonly programIndex: number;
  readonly offsetMs: number;
  readonly manifestUrl: string;
}

export type LoadPlaybackInstruction = (
  channelId: string,
) => Promise<PlaybackInstruction>;

export type AttachPlayback = (
  video: HTMLVideoElement,
  manifestUrl: string,
) => () => void;

interface ChannelPlayerProps {
  readonly channelId: string;
  readonly loadPlaybackInstruction: LoadPlaybackInstruction;
  readonly attachPlayback: AttachPlayback;
}

export function ChannelPlayer({
  channelId,
  loadPlaybackInstruction,
  attachPlayback,
}: ChannelPlayerProps) {
  const [playbackInstruction, setPlaybackInstruction] =
    useState<PlaybackInstruction | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void loadPlaybackInstruction(channelId)
      .then((instruction) => {
        setPlaybackInstruction(instruction);
      })
      .catch(() => {
        setLoadFailed(true);
      });
  }, [channelId, loadPlaybackInstruction]);

  useEffect(() => {
    const video = videoRef.current;

    if (video === null || playbackInstruction === null) {
      return;
    }

    try {
      return attachPlayback(video, playbackInstruction.manifestUrl);
    } catch (error) {
      setLoadFailed(true);
    }
  }, [attachPlayback, playbackInstruction]);

  const channelNumber = channelId.replace(/^channel-/, "");

  if (loadFailed) {
    return <p role="alert">Unable to tune Channel {channelNumber}</p>;
  }

  if (playbackInstruction == null) {
    return <p role="status">Tuning Channel {channelNumber}</p>;
  }

  return (
    <video
      ref={videoRef}
      aria-label={`Channel ${channelNumber}`}
      controls
      autoPlay
      playsInline
    />
  );
}
