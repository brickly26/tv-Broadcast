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

## Developer experience

- TypeScript: 3–4
- React: 3–4
- Backend APIs: 3–4
- SQL: 3–4
- Docker: 2–3
- Automated testing: 0–1

Guidance should move quickly through familiar application-development concepts while explaining Docker and testing carefully.

## Last completed milestone

The epoch-anchored looping-playlist resolver was completed and committed on 2026-07-23. Seven controlled-clock tests cover slot resolution, item and cycle boundaries, forward and backward wrapping, an empty playlist, and a zero-duration item. Type checking and unused-code checks pass.

## Development environment inventory

- Node.js: v22.16.0, managed under NVM
- npm: 11.4.2
- TypeScript project dependency: 7.0.2
- Vitest project dependency: 4.1.10
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

## Current task

Define the Fastify server-time endpoint behavior and its first failing test.

## Next task

Create the minimal API workspace needed to run that test, then implement the endpoint through red-green-refactor.

## First implementation milestone

Build the smallest synchronization experiment:

- one channel;
- two short HLS fixtures;
- deterministic schedule calculation;
- a unit test using a controlled clock;
- two-browser synchronization verification.
