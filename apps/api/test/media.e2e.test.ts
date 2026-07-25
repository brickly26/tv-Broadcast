import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";

describe("GET /media/:channelId/:programId/:fileName", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, {
      logger: false,
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves Program A's HLS manifest", async () => {
    const response = await request(app.getHttpServer()).get(
      "/media/channel-1/program-a/index.m3u8",
    );

    const manifestText = Buffer.isBuffer(response.body)
      ? response.body.toString("utf8")
      : response.text;

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toContain(
      "application/vnd.apple.mpegurl",
    );
    expect(manifestText).toContain("#EXTM3U");
    expect(manifestText).toContain("segment-000.ts");
  });

  it("returns 404 when the media file does not exist", async () => {
    const response = await request(app.getHttpServer()).get(
      "/media/channel-1/program-a/missing-segment.ts",
    );

    expect(response.status).toBe(404);
  });

  it("serves an HLS media segment", async () => {
    const response = await request(app.getHttpServer()).get(
      "/media/channel-1/program-a/segment-000.ts",
    );

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toContain("video/mp2t");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.byteLength).toBeGreaterThan(0);
  });
});
