# TV Broadcast Project Status

## Current phase

Phase 1 — Synchronization vertical slice

## Repository

https://github.com/brickly26/tv-Broadcast

## Completed decisions

- Working name: TV Broadcast
- TypeScript stack
- Three-channel first version
- Eventually 10–15 channels
- Epoch-anchored pseudo-live HLS
- Original-file uploads
- Continuously looping channel playlists
- No wall-clock premieres or future schedule activation in the initial product
- Public viewers and one administrator
- Synchronization target within two seconds
- Testing included throughout development
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

Guidance should move quickly through familiar application-development concepts while explaining Docker and testing carefully.

## Last completed milestone

The current-program playback-instruction response was completed on 2026-07-24. It now includes a root-relative `manifestUrl` derived from the validated channel ID and resolved program ID. Controlled-clock end-to-end coverage verifies matching Program A and Program B manifest URLs on opposite sides of the playlist boundary. The complete suite has fourteen passing tests, and type checking, the Webpack production build, and whitespace validation pass.

## Development environment inventory

- Node.js: v22.16.0, managed under NVM
- npm: 11.4.2
- TypeScript project dependency: 6.0.3
- Vitest project dependency: 4.1.10
- NestJS API dependencies: 11.1.28
- NestJS static-serving dependency: 5.0.5
- NestJS CLI project dependency: 11.0.24
- Supertest API test dependency: 7.2.2
- SWC test transformer: 1.15.46 through unplugin-swc 1.5.9
- Webpack API bundler: 5.106.2 through Nest CLI
- TypeScript Webpack loader: 9.6.2
- Corepack: installed
- pnpm: not installed
- Yarn: not installed
- Git: 2.50.1 (Apple Git-155)
- FFmpeg: 7.1.1
- FFprobe: 7.1.1
- Docker client and engine: 28.4.0
- Docker Compose: v2.39.2-desktop.1
- Local project folder: initialized as a Git repository on `main`, tracking `origin/main`
- GitHub repository: contains the initial foundation commit `3041fdf` on `main`
- Local Git remote: `origin` points to https://github.com/brickly26/tv-Broadcast.git for fetch and push
- Current working branch: `phase-1/synchronization-slice`

## Dependency audit

- Production dependencies: zero known vulnerabilities on 2026-07-24.
- Development dependencies: four high-severity audit findings share one transitive Nest CLI build-tool chain through `fork-ts-checker-webpack-plugin`, `minimatch`, and `brace-expansion`.
- The current npm force-fix recommendation would downgrade Nest CLI from 11 to 6. The breaking forced downgrade was rejected; monitor the upstream toolchain for a compatible fix.

## Current task

Define the minimal browser playback client's behavior, acceptance criteria, and first automated test boundary.

## Next task

Create the smallest React and Vite workspace needed for the one-channel HLS playback experiment, then implement it through red-green-refactor.

## First implementation milestone

Build the smallest synchronization experiment:

- one channel;
- two short HLS fixtures;
- deterministic schedule calculation;
- a unit test using a controlled clock;
- two-browser synchronization verification.
