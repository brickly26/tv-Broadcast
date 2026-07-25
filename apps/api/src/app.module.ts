import { Module } from "@nestjs/common";
import { join } from "node:path";

import { Clock, SystemClock } from "./clock";
import { TimeController } from "./time.controller";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "fixtures", "hls"),
      serveRoot: "/media",
    }),
  ],
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
