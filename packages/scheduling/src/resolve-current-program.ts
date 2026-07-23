export interface PlaylistItem {
  readonly id: string;
  readonly durationMs: number;
}

export interface LoopingPlaylist {
  readonly playbackEpochMs: number;
  readonly programs: readonly PlaylistItem[];
}

export interface CurrentProgram {
  readonly programId: string;
  readonly programIndex: number;
  readonly offsetMs: number;
}

export function resolveCurrentProgram(
  playlist: LoopingPlaylist,
  nowMs: number,
): CurrentProgram {
  if (playlist.programs.length === 0) {
    throw new Error("Playlist must contain at least one program");
  }

  if (playlist.programs.some((p) => p.durationMs <= 0)) {
    throw new Error("Program durations must be greater than zero");
  }

  const cycleDurationMs = playlist.programs.reduce(
    (total, program) => total + program.durationMs,
    0,
  );

  const elapsedMs = nowMs - playlist.playbackEpochMs;
  const cycleOffsetMs =
    ((elapsedMs % cycleDurationMs) + cycleDurationMs) % cycleDurationMs;

  let slotStartMs = 0;

  for (const [programIndex, program] of playlist.programs.entries()) {
    const slotEndMs = slotStartMs + program.durationMs;

    if (cycleOffsetMs < slotEndMs) {
      return {
        programId: program.id,
        programIndex,
        offsetMs: cycleOffsetMs - slotStartMs,
      };
    }

    slotStartMs = slotEndMs;
  }

  throw new Error("Time falls outside the current playlist cycle");
}
