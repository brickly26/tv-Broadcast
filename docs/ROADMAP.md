# TV Broadcast Roadmap

## Phase 0 — Foundation

- Record product scope and architecture.
- Establish the learning and collaboration workflow.
- Verify local development prerequisites.
- Create the repository and application structure.

## Phase 1 — Synchronization vertical slice

- One channel.
- Two already-prepared local HLS fixtures.
- Server-time endpoint.
- Current-program calculation.
- Two-browser synchronization test.

## Phase 2 — Domain and API

- PostgreSQL schema.
- Channels, assets, ordered playlists, and playback epochs.
- Atomic playlist update workflow.
- Unit and integration tests.

## Phase 3 — Video pipeline

- Direct source upload.
- FFprobe inspection.
- Thumbnail generation.
- Multiple resolutions.
- HLS packaging and artifact validation.

## Phase 4 — Distributed job processing

- Redis and BullMQ.
- Independent workers.
- Retry and backoff.
- Idempotency.
- Dead-letter queue and replay.

## Phase 5 — Set-top-box experience

- Three channels.
- Channel navigation.
- Current and next program display.
- Loading, failure, and recovery behavior.
- End-to-end browser tests.

## Phase 6 — Scale and deployment

- Expand toward 10–15 channels.
- S3-compatible production storage.
- CDN delivery.
- Worker scaling.
- Continuous integration and deployment.

## Phase 7 — Reliability

- Metrics and structured logs.
- Worker failure drills.
- Load testing.
- Alerting.
- Operational documentation.
