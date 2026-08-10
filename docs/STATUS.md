# TV Broadcast Project Status

## Current phase

Phase 1 — Server-authoritative rolling live vertical slice

## Repository

https://github.com/brickly26/tv-Broadcast

## Completed decisions

- Working name: TV Broadcast
- TypeScript stack
- Three-channel first version, eventually 10–15 channels
- Continuously looping playlists anchored to a shared server-time epoch
- Server-authoritative rolling live HLS publication
- Preprocessed reusable HLS segments; no continuously running transcoder is required
- Future and expired segments are denied by the delivery layer, not hidden by the UI
- Private-by-default source and production media storage
- Public viewers and one administrator
- Synchronization target within two seconds
- No DRM claim: already-delivered media can still be recorded
- Original-file uploads; YouTube URLs are metadata only
- Testing and security negative tests throughout development
- npm workspaces for repository package management
- NestJS with the default Express adapter for the API
- A separate plain Node.js and TypeScript video worker

## Developer experience

- TypeScript: 3–4
- React: 3–4
- Backend APIs: 3–4
- SQL: 3–4
- Docker: 2–3
- Automated testing: 0–1

Guidance should move quickly through familiar application-development concepts while explaining new testing, video, security, and infrastructure concepts carefully. Closely related behaviors may be taught in coherent batches, with bounded challenges for the developer.

## Last completed milestone

Milestones 1A and the pure portion of 1B were completed on 2026-08-02. Fifteen controlled-clock tests cover exact publication boundaries, future-segment exclusion, rolling-window expiry, program and playlist-cycle transitions, variable segment durations, and invalid playlist, duration, window, and pre-epoch inputs. Five manifest-rendering tests cover live HLS tags, sequence-only URLs, private-identifier and future-sequence non-disclosure, target-duration rounding, program-boundary discontinuities, and inconsistent-window rejection.

The dynamic Channel 1 live-manifest endpoint was completed on 2026-08-02. Three controlled-clock end-to-end tests verify the initial rolling window, advancement when server time crosses a segment boundary, and a 404 response for an unknown channel. The full suite passes with 51 tests, type checking and both production builds succeed, the production dependency audit reports zero known vulnerabilities, and the diff check passes.

The publication-enforced segment gateway was completed on 2026-08-10. Seven controlled-clock end-to-end tests prove successful delivery inside the six-segment window, future-segment denial, availability at the exact publication boundary, denial after window expiry, wrong-channel isolation, malformed-filename denial, and denial of distant unavailable sequences. Eligible responses stream nonempty MPEG-TS bytes; denials use a generic `404`; both use `Cache-Control: no-store`. The full suite passes with 58 tests, type checking and both production builds succeed, the production dependency audit reports zero known vulnerabilities, and the diff check passes.

The unrestricted `/media` prototype route was retired on 2026-08-10. Complete VOD manifests and raw fixture segments now return `404`, current-program metadata no longer exposes private manifest URLs, the static-serving dependency and custom Webpack workaround were removed, and Vite no longer proxies `/media`. The authorized live manifest and segment gateway remain green. The full suite passes with 57 tests, type checking and both production builds succeed, the production dependency audit reports zero known vulnerabilities, and the diff check passes.

The earlier end-to-end Channel 1 VOD prototype remains reusable as internal validation and client-adapter work. The web client loads playback instructions, selects hls.js or native HLS, reports unsupported playback, and releases media resources during React cleanup. Its active integration must now be pointed at the channel live manifest rather than a program VOD URL.

## Reusable completed work

- Epoch-anchored looping-playlist resolver and its seven controlled-clock tests.
- FFmpeg fixture generator, two-second HLS segments, and FFprobe/decode validation workflow.
- NestJS bootstrap, server clock abstraction, controlled-clock API testing, and workspace bundling.
- React/Vite application, current loading and failure states, hls.js/native adapter, and cleanup tests.
- API, component, adapter, type-check, build, and local smoke-test workflows.

## Work replaced or paused

- Public static `/media` delivery was retired from the viewer path on 2026-08-10; fixtures and validation manifests remain internal artifacts.
- The current-program endpoint is metadata-only and no longer returns private asset manifest URLs.
- Client-side authoritative-offset seeking is no longer the playback model.
- The in-progress request-timing/offset work is paused. Timing may later be reused for telemetry or bounded drift correction, but not for publication authorization.
- Earlier positive tests for complete VOD manifests and raw asset segments were replaced with publication-window tests and direct-request denial tests.

## Development environment inventory

- Node.js: v22.16.0, managed under NVM
- npm: 11.4.2
- TypeScript project dependency: 6.0.3
- Vitest project dependency: 4.1.10
- React and React DOM web dependencies: 19.2.8
- Vite web build dependency: 8.1.5
- hls.js web dependency: 1.6.16
- React Testing Library web dependency: 16.3.2
- DOM Testing Library web dependency: 10.4.1
- Testing Library jest-dom matchers: 7.0.0
- jsdom web test environment: 29.1.1
- NestJS API dependencies: 11.1.28
- NestJS CLI project dependency: 11.0.24
- Supertest API test dependency: 7.2.2
- SWC test transformer: 1.15.46 through unplugin-swc 1.5.9
- Webpack API bundler: 5.106.2 through Nest CLI
- TypeScript Webpack loader: 9.6.2
- Corepack: installed
- pnpm: not installed
- Yarn: not installed
- Git: 2.50.1 (Apple Git-155)
- FFmpeg and FFprobe: 7.1.1
- Docker client and engine: 28.4.0
- Docker Compose: v2.39.2-desktop.1
- Current working branch: `phase-1/synchronization-slice`

## Dependency audit

- Production dependencies: zero known vulnerabilities on 2026-08-10.
- Development dependencies: four high-severity audit findings share one transitive Nest CLI build-tool chain through `fork-ts-checker-webpack-plugin`, `minimatch`, and `brace-expansion`.
- The current npm force-fix recommendation would downgrade Nest CLI from 11 to 6. The breaking forced downgrade was rejected; monitor the upstream toolchain for a compatible fix.

## Current task

Commit and push the verified raw-media shutdown checkpoint.

## Next task

Point the React player at the server-authoritative channel live manifest and remove client-authoritative offset seeking from the active playback path.

## Revised Phase 1 implementation order

1. Deterministic segment timeline and rolling publication resolver.
2. Dynamic live manifest containing only published channel sequences.
3. Publication-enforced segment gateway and removal of unrestricted viewer `/media` access.
4. Browser playback from the channel live manifest.
5. Two-browser synchronization and direct future/expired segment denial in Playwright.

Do not resume client offset-seeking work before these milestones.
