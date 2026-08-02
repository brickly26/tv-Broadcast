import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";
import { Clock } from "../src/clock";

describe("GET /api/channels/:channelId/live/index.m3u8", () => {
  const playbackEpochMs = Date.UTC(2026, 0, 1, 12, 0, 0);
  let currentServerTimeMs = playbackEpochMs + 65_000;

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

  it("publishes only the current rolling segment window", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/index.m3u8",
    );

    const manifest = Buffer.isBuffer(response.body)
      ? response.body.toString("utf8")
      : response.text;

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain(
      "application/vnd.apple.mpegurl",
    );
    expect(response.headers["cache-control"]).toBe("no-store");

    expect(manifest).toBe(
      [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "#EXT-X-TARGETDURATION:2",
        "#EXT-X-MEDIA-SEQUENCE:26",
        "#EXTINF:2.000,",
        "segments/26.ts",
        "#EXTINF:2.000,",
        "segments/27.ts",
        "#EXTINF:2.000,",
        "segments/28.ts",
        "#EXTINF:2.000,",
        "segments/29.ts",
        "#EXT-X-DISCONTINUITY",
        "#EXTINF:2.000,",
        "segments/30.ts",
        "#EXTINF:2.000,",
        "segments/31.ts",
        "",
      ].join("\n"),
    );

    expect(manifest).not.toContain("segments/25.ts");
    expect(manifest).not.toContain("segments/32.ts");
    expect(manifest).not.toContain("program-a");
    expect(manifest).not.toContain("program-b");
    expect(manifest).not.toContain("#EXT-X-ENDLIST");
  });

  it("advances the published window as server time advances", async () => {
    currentServerTimeMs = playbackEpochMs + 66_000;

    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/index.m3u8",
    );

    const manifest =
      typeof response.body === "string" ? response.body : response.text;

    expect(response.status).toBe(200);
    expect(manifest).toContain("#EXT-X-MEDIA-SEQUENCE:27");
    const segmentUris = manifest
      .split("\n")
      .filter((line) => line.startsWith("segments/"));

    expect(segmentUris).toEqual([
      "segments/27.ts",
      "segments/28.ts",
      "segments/29.ts",
      "segments/30.ts",
      "segments/31.ts",
      "segments/32.ts",
    ]);
  });

  it("returns 404 when the channel does not exist", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/missing-channel/live/index.m3u8",
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Channel "missing-channel" was not found',
    });
  });
});
