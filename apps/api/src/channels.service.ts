import { Injectable, NotFoundException } from "@nestjs/common";
import {
  resolveCurrentProgram,
  type LoopingPlaylist,
} from "@tv-broadcast/scheduling";

import { Clock } from "./clock";

const channelOnePlaylist: LoopingPlaylist = {
  playbackEpochMs: Date.UTC(2026, 0, 1, 12, 0, 0),
  programs: [
    { id: "program-a", durationMs: 60_000 },
    { id: "program-b", durationMs: 30_000 },
  ],
};

const channelOneId = "channel-1";

@Injectable()
export class ChannelsService {
  constructor(private readonly clock: Clock) {}

  getCurrentProgram(channelId: string) {
    if (channelId !== channelOneId) {
      throw new NotFoundException(`Channel "${channelId}" was not found`);
    }

    const serverTimeMs = this.clock.now();

    const currentProgram = resolveCurrentProgram(
      channelOnePlaylist,
      serverTimeMs,
    );

    return {
      channelId,
      serverTimeMs,
      ...currentProgram,
      manifestUrl: `/media/${channelId}/${currentProgram.programId}/index.m3u8`,
    };
  }
}
