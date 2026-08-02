export interface PlaylistSegment {
  readonly id: string;
  readonly durationMs: number;
}

export interface SegmentedProgram {
  readonly id: string;
  readonly segments: readonly PlaylistSegment[];
}

export interface SegmentedLoopingPlaylist {
  readonly playbackEpochMs: number;
  readonly programs: readonly SegmentedProgram[];
}

export interface PublishedSegment {
  readonly sequence: number;
  readonly programId: string;
  readonly segmentId: string;
  readonly segmentIndex: number;
  readonly durationMs: number;
}

export interface PublishedSegmentWindow {
  readonly firstSequence: number;
  readonly nextSequence: number;
  readonly segments: readonly PublishedSegment[];
}

export function resolvePublishedSegmentWindow(
  playlist: SegmentedLoopingPlaylist,
  nowMs: number,
  windowSizeSegments: number,
): PublishedSegmentWindow {
  if (!Number.isInteger(windowSizeSegments) || windowSizeSegments <= 0) {
    throw new Error("Window size must be a positive integer");
  }

  if (playlist.programs.length === 0) {
    throw new Error("Playlist must contain at least one program");
  }

  const flattenedSegments = playlist.programs.flatMap((program) => {
    if (program.segments.length === 0) {
      throw new Error("Program must contain at least one segment");
    }

    return program.segments.map((s, segmentIndex) => {
      if (!Number.isFinite(s.durationMs) || s.durationMs <= 0) {
        throw new Error("Segment duration must be greater than zero");
      }

      return {
        programId: program.id,
        segment: s,
        segmentIndex,
      };
    });
  });

  const cycleDuration = flattenedSegments.reduce(
    (sum, s) => sum + s.segment.durationMs,
    0,
  );

  const elapsedTime = nowMs - playlist.playbackEpochMs;

  if (elapsedTime < 0) {
    throw new Error("Cannot publish segments before the playback epoch");
  }

  const completeCycles = Math.floor(elapsedTime / cycleDuration);
  const timeInsideCurrentCycle = elapsedTime % cycleDuration;

  let completedSegmentsInCurrentCycle = 0;
  let segmentEndMs = 0;

  for (const { segment } of flattenedSegments) {
    segmentEndMs += segment.durationMs;

    if (segmentEndMs > timeInsideCurrentCycle) {
      break;
    }

    completedSegmentsInCurrentCycle += 1;
  }

  const nextSequence =
    completeCycles * flattenedSegments.length + completedSegmentsInCurrentCycle;

  const firstSequence = Math.max(0, nextSequence - windowSizeSegments);

  const segments: PublishedSegment[] = [];

  for (let sequence = firstSequence; sequence < nextSequence; sequence += 1) {
    const segmentInCycle =
      flattenedSegments[sequence % flattenedSegments.length];

    if (segmentInCycle === undefined) {
      throw new Error("Unable to map channel sequence to a playlist segment");
    }

    segments.push({
      sequence,
      programId: segmentInCycle.programId,
      segmentId: segmentInCycle.segment.id,
      segmentIndex: segmentInCycle.segmentIndex,
      durationMs: segmentInCycle.segment.durationMs,
    });
  }

  return {
    firstSequence,
    nextSequence,
    segments,
  };
}
