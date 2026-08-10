import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";
import { Clock } from "../src/clock";

describe("GET /api/channels/:channelId/live/segments/:sequenceFile", () => {
  const playbackEpochMs = Date.UTC(2026, 0, 1, 12, 0, 0);
  const initialServerTimeMs = playbackEpochMs + 65_000;

  let currentServerTimeMs = initialServerTimeMs;

  let app: INestApplication;

  beforeEach(() => {
    currentServerTimeMs = initialServerTimeMs;
  });

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

  it("serves a segment inside the current published window", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/31.ts",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("video/mp2t");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.byteLength).toBeGreaterThan(0);
  });

  it("denies a future segment", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/32.ts",
    );

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: "Segment was not found",
    });
  });

  it("publishes a segment at its exact publication boundary", async () => {
    currentServerTimeMs = playbackEpochMs + 65_999;

    const beforePublication = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/32.ts",
    );

    expect(beforePublication.status).toBe(404);

    currentServerTimeMs = playbackEpochMs + 66_000;

    const atPublication = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/32.ts",
    );

    expect(atPublication.status).toBe(200);
    expect(atPublication.headers["content-type"]).toContain("video/mp2t");
    expect(atPublication.headers["cache-control"]).toBe("no-store");
    expect(atPublication.body.byteLength).toBeGreaterThan(0);
  });

  it("denies a segment after it expires from the rolling window", async () => {
    currentServerTimeMs = playbackEpochMs + 65_000;

    const whilePublished = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/26.ts",
    );

    currentServerTimeMs = playbackEpochMs + 66_000;

    expect(whilePublished.status).toBe(200);

    const afterExpiry = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/26.ts",
    );

    expect(afterExpiry.status).toBe(404);
    expect(afterExpiry.headers["cache-control"]).toBe("no-store");
    expect(afterExpiry.body).toMatchObject({
      statusCode: 404,
      message: "Segment was not found",
    });
  });

  it("denies a sequence requested through the wrong channel", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-2/live/segments/31.ts",
    );

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: "Segment was not found",
    });
  });

  it("denies a malformed segment filename", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/segment-001.ts",
    );

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: "Segment was not found",
    });
  });

  it("denies an unavailable distant sequence", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/channels/channel-1/live/segments/999999.ts",
    );

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: "Segment was not found",
    });
  });
});
