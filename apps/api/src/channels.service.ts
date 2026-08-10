import { Injectable, NotFoundException } from "@nestjs/common";
import {
  resolveCurrentProgram,
  resolvePublishedSegmentWindow,
  type LoopingPlaylist,
  type SegmentedLoopingPlaylist,
} from "@tv-broadcast/scheduling";

import { renderLiveMediaPlaylist } from "./live/render-live-media-playlist";

import { Clock } from "./clock";

const channelOneId = "channel-1";
const segmentDurationMs = 2_000;
const liveWindowSizeSegments = 6;
const channelOnePlaybackEpochMs = Date.UTC(2026, 0, 1, 12, 0, 0);

function createFixtureSegments(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `segment-${index.toString().padStart(3, "0")}.ts`,
    durationMs: segmentDurationMs,
  }));
}

const channelOneSegmentedPlaylist: SegmentedLoopingPlaylist = {
  playbackEpochMs: channelOnePlaybackEpochMs,
  programs: [
    {
      id: "program-a",
      segments: createFixtureSegments(30),
    },
    {
      id: "program-b",
      segments: createFixtureSegments(15),
    },
  ],
};

const channelOnePlaylist: LoopingPlaylist = {
  playbackEpochMs: channelOneSegmentedPlaylist.playbackEpochMs,
  programs: channelOneSegmentedPlaylist.programs.map((program) => ({
    id: program.id,
    durationMs: program.segments.reduce(
      (total, segment) => total + segment.durationMs,
      0,
    ),
  })),
};

const channelOneTargetDurationMs = Math.max(
  ...channelOneSegmentedPlaylist.programs.flatMap((program) =>
    program.segments.map((segment) => segment.durationMs),
  ),
);

@Injectable()
export class ChannelsService {
  constructor(private readonly clock: Clock) {}

  getCurrentProgram(channelId: string) {
    this.assertChannelExists(channelId);

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

  getPublishedSegment(channelId: string, sequence: number) {
    if (
      channelId !== channelOneId ||
      !Number.isSafeInteger(sequence) ||
      sequence < 0
    ) {
      throw new NotFoundException("Segment was not found");
    }

    const publishedWindow = resolvePublishedSegmentWindow(
      channelOneSegmentedPlaylist,
      this.clock.now(),
      liveWindowSizeSegments,
    );

    const segment = publishedWindow.segments.find(
      (candidate) => candidate.sequence === sequence,
    );

    if (segment === undefined) {
      throw new NotFoundException("Segment was not found");
    }

    return segment;
  }

  getLiveManifest(channelId: string): string {
    this.assertChannelExists(channelId);

    const publishedWindow = resolvePublishedSegmentWindow(
      channelOneSegmentedPlaylist,
      this.clock.now(),
      liveWindowSizeSegments,
    );

    return renderLiveMediaPlaylist(publishedWindow, channelOneTargetDurationMs);
  }

  private assertChannelExists(channelId: string): void {
    if (channelId !== channelOneId) {
      throw new NotFoundException(`Channel "${channelId}" was not found`);
    }
  }
}
