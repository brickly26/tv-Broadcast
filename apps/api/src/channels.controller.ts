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
}
