import { Module } from "@nestjs/common";

import { Clock, SystemClock } from "./clock";
import { TimeController } from "./time.controller";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";

@Module({
  providers: [
    {
      provide: Clock,
      useClass: SystemClock,
    },
    ChannelsService,
  ],
  controllers: [TimeController, ChannelsController],
})
export class AppModule {}
