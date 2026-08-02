import { Controller, Get, Header, Param } from "@nestjs/common";

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
}
