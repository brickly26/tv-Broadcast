import { Module } from "@nestjs/common";

import { Clock, SystemClock } from "./clock";
import { TimeController } from "./time.controller";

@Module({
  providers: [
    {
      provide: Clock,
      useClass: SystemClock,
    },
  ],
  controllers: [TimeController],
})
export class AppModule {}
