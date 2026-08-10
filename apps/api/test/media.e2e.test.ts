import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";

describe("unrestricted raw media access", () => {
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

  it("does not expose complete VOD manifests", async () => {
    const response = await request(app.getHttpServer()).get(
      "/media/channel-1/program-a/index.m3u8",
    );

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toMatchObject({
      statusCode: 404,
    });
  });

  it("does not expose raw fixture segments", async () => {
    const response = await request(app.getHttpServer()).get(
      "/media/channel-1/program-a/segment-000.ts",
    );

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toMatchObject({
      statusCode: 404,
    });
  });
});
