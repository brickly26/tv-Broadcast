import { createReadStream } from "node:fs";
import { join } from "node:path";

import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  StreamableFile,
} from "@nestjs/common";

import { ChannelsService } from "./channels.service";

@Controller("api/channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get(":channelId/current-program")
  @Header("Cache-Control", "no-store")
  getCurrentProgram(@Param("channelId") channelId: string) {
    return this.channelsService.getCurrentProgram(channelId);
  }

  @Get(":channelId/live/index.m3u8")
  @Header("Content-Type", "application/vnd.apple.mpegurl")
  @Header("Cache-Control", "no-store")
  getLiveManifest(@Param("channelId") channelId: string): string {
    return this.channelsService.getLiveManifest(channelId);
  }

  @Get(":channelId/live/segments/:sequenceFile")
  @Header("Cache-Control", "no-store")
  getLiveSegment(
    @Param("channelId") channelId: string,
    @Param("sequenceFile") sequenceFile: string,
  ): StreamableFile {
    const match = /^(\d+)\.ts$/.exec(sequenceFile);

    if (match === null) {
      throw new NotFoundException("Segment was not found");
    }

    const sequence = Number(match[1]);

    const segment = this.channelsService.getPublishedSegment(
      channelId,
      sequence,
    );

    const segmentPath = join(
      __dirname,
      "..",
      "..",
      "..",
      "fixtures",
      "hls",
      channelId,
      segment.programId,
      segment.segmentId,
    );

    return new StreamableFile(createReadStream(segmentPath), {
      type: "video/mp2t",
    });
  }
}
