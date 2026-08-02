# TV Broadcast Roadmap

Every milestone that changes a trust boundary includes security acceptance criteria and negative tests. UI controls and undiscoverable URLs never count as enforcement.

## Phase 0 — Foundation (complete)

- Record product scope and architecture.
- Establish the learning and collaboration workflow.
- Verify local development prerequisites.
- Create the repository and application structure.

## Phase 1 — Server-authoritative rolling live vertical slice

### Milestone 1A — Deterministic channel segment timeline

Behavior:

- Extend the epoch-anchored loop into a continuous sequence of scheduled media segments.
- Resolve the six most recently completed channel sequences from authoritative time, with the window size configurable.
- Publish a segment only after its scheduled interval has ended.

Acceptance criteria:

- The resolver works across segment, program, and playlist-cycle boundaries; public publication requests before the configured epoch are rejected.
- Variable segment durations are supported; the implementation does not assume every segment is exactly two seconds.
- The result identifies the public channel sequence and the private fixture segment needed for delivery.
- Viewer-visible sequences are nonnegative because a public channel's epoch is configured in the past.

Security criteria and tests:

- A sequence after the live edge is classified as future.
- A sequence before the rolling-window cutoff is classified as expired.
- Boundary tests prove a segment is unavailable one millisecond before its publish time and available exactly at that time.
- Unknown and wrong-channel sequences do not resolve to private media.

Test level: framework-independent Vitest unit tests with a controlled clock. This is the smallest, fastest place to prove the publication rules.

### Milestone 1B — Rolling live manifest

Behavior:

- Add `GET /api/channels/:channelId/live/index.m3u8`.
- Generate a live playlist containing only the current published window.
- Advance `#EXT-X-MEDIA-SEQUENCE` as the window moves and omit `#EXT-X-ENDLIST`.
- Insert discontinuity markers when required at program boundaries.

Acceptance criteria:

- Repeated requests at controlled times show the window advancing.
- Every URI in the manifest uses the channel-sequence segment route.
- The response has the HLS media-playlist content type and `Cache-Control: no-store`.

Security criteria and tests:

- No future sequence, private object key, asset path, full VOD URL, or source URL appears in the response.
- Unknown channels return `404`.
- API end-to-end tests inspect the complete manifest body, not only a happy-path substring.

### Milestone 1C — Publication-enforced segment gateway

Behavior:

- Add `GET /api/channels/:channelId/live/segments/:sequence.ts`.
- Re-evaluate publication eligibility on every request, then stream the mapped private segment.
- Retire unrestricted `/media` access from the viewer path.

Acceptance criteria:

- An in-window sequence returns the expected MPEG-TS bytes and content type.
- The fixture generator and internal VOD manifests remain usable for preprocessing validation.

Security criteria and tests:

- Direct requests for future and expired sequences return `404`.
- Unknown sequences, wrong-channel sequences, raw fixture paths, and complete VOD manifests return `404` through public viewer routes.
- Segment responses use `Cache-Control: no-store` in the initial implementation.
- Tests request guessed URLs directly; success must not depend on whether a URL appeared in a manifest.

### Milestone 1D — Browser live-channel playback

Behavior:

- Point the existing HLS browser adapter at the channel live manifest.
- Let hls.js or native HLS refresh the manifest and follow its live edge.
- Keep loading, failure, unsupported-browser, and cleanup behavior.

Acceptance criteria:

- Two independent browser sessions remain within two seconds under normal local conditions.
- The player receives new segments without reloading a full VOD asset.
- Pause and rewind cannot move beyond the retained rolling window.

Security criteria and tests:

- Browser code never receives private asset paths or an instruction to seek into a VOD asset.
- Component tests prove the live channel URL is attached; API tests remain responsible for publication enforcement.
- A Playwright test compares two players and verifies that a guessed future segment request fails.

Phase 1 exit criteria:

- One channel loops two preprocessed fixtures through a rolling live HLS playlist.
- Two browsers remain within two seconds.
- Complete VOD media and future or expired channel segments are inaccessible from the viewer path.
- Unit, API end-to-end, browser end-to-end, type-check, and production-build checks pass.

## Phase 2 — Domain and API

- PostgreSQL schema for channels, private assets, ordered playlists, playback epochs, and segment metadata.
- Atomic playlist update workflow with an explicit active-channel transition rule.
- Public program metadata separated from private media locators.
- Authorization tests for administrative mutations and publication tests for viewer media.
- Testcontainers integration tests for PostgreSQL.

## Phase 3 — Secure video pipeline

- Direct source upload into private storage.
- File validation and FFprobe inspection.
- Thumbnail generation.
- Multiple resolutions.
- HLS packaging with aligned segment boundaries and artifact validation.
- Persist exact segment durations and private object keys for channel publication.
- Negative tests proving originals, incomplete jobs, and unpublished renditions cannot enter the viewer path.

## Phase 4 — Distributed job processing

- Redis and BullMQ.
- Independent workers.
- Retry and exponential backoff.
- Idempotent processing and publication.
- Dead-letter queue and administrative replay.
- Tests for duplicate delivery, partial output, permanent failure, and unauthorized replay.

## Phase 5 — Set-top-box experience

- Three channels.
- Channel-up, channel-down, and direct selection.
- Current and next program display using public metadata only.
- Loading, failure, and recovery behavior.
- End-to-end channel switching and synchronization tests.

## Phase 6 — Scale and secure delivery

- Expand toward 10–15 channels.
- Private S3-compatible production storage.
- Authorization-aware CDN or short-lived capability design recorded in an ADR before direct CDN delivery.
- Cache-policy tests proving future and expired content cannot be served from cache.
- Worker and API scaling.
- Continuous integration and deployment.

## Phase 7 — Reliability

- Metrics and structured logs for publication lag, manifest generation, denied segment requests, and viewer drift.
- Worker failure and storage-access drills.
- k6 load testing for manifests and segment authorization.
- Alerting and operational documentation.
