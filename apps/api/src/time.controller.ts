import { Controller, Get, Header } from "@nestjs/common";

import { Clock } from "./clock";

@Controller("api/time")
export class TimeController {
  constructor(private readonly clock: Clock) {}

  @Get()
  @Header("Cache-Control", "no-store")
  getServerTime(): { serverTimeMs: number } {
    return {
      serverTimeMs: this.clock.now(),
    };
  }
}
