export interface PlaybackTiming {
  readonly resolvedOffsetMs: number;
  readonly roundTripMs: number;
  readonly elapsedSinceResponseMs: number;
}

export function estimatePlaybackOffsetMs(timing: PlaybackTiming): number {
  return (
    timing.resolvedOffsetMs +
    timing.roundTripMs / 2 +
    timing.elapsedSinceResponseMs
  );
}
