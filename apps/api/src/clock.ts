import { Injectable } from "@nestjs/common";

export abstract class Clock {
  abstract now(): number;
}

@Injectable()
export class SystemClock extends Clock {
  now(): number {
    return Date.now();
  }
}
