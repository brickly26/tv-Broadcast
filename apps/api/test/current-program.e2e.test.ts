import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";
import { Clock } from "../src/clock";

describe("GET /api/channels/:channelId/current-program", () => {
  const playbackEpochMs = Date.UTC(2026, 0, 1, 12, 0, 0);
  let currentServerTimeMs = playbackEpochMs + 25_000;

  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Clock)
      .useValue({
        now: () => currentServerTimeMs,
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the authoritative channel program without allowing caching", async () => {
    currentServerTimeMs = playbackEpochMs + 25_000;

    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/current-program",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      channelId: "channel-1",
      serverTimeMs: currentServerTimeMs,
      programId: "program-a",
      programIndex: 0,
      offsetMs: 25000,
      manifestUrl: "/media/channel-1/program-a/index.m3u8",
    });
  });

  it("returns 404 when the channel does not exist", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/missing-channel/current-program",
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Channel "missing-channel" was not found',
    });
  });

  it("returns Program B's manifest after crossing the slot boundary", async () => {
    currentServerTimeMs = playbackEpochMs + 65_000;

    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/current-program",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      channelId: "channel-1",
      serverTimeMs: currentServerTimeMs,
      programId: "program-b",
      programIndex: 1,
      offsetMs: 5_000,
      manifestUrl: "/media/channel-1/program-b/index.m3u8",
    });
  });
});
