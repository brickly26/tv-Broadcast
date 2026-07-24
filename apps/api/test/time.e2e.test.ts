import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module";
import { Clock } from "../src/clock";

describe("GET /api/time", () => {
  const fixedServerTimeMs = Date.UTC(2026, 0, 1, 12, 0, 0);

  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Clock)
      .useValue({
        now: () => fixedServerTimeMs,
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the authoritative server time without allowing caching", async () => {
    const response = await request(app.getHttpServer()).get("/api/time");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      serverTimeMs: fixedServerTimeMs,
    });
  });
});
