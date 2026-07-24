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

The executable NestJS API bootstrap was completed on 2026-07-24. The API builds with the Nest CLI, starts on port 3000 by default, honors a `PORT` override verified on port 3100, and serves `GET /api/time` through a real local HTTP connection. The complete suite has eight passing tests; type checking, the production build, and whitespace validation pass.

## Development environment inventory

- Node.js: v22.16.0, managed under NVM
- npm: 11.4.2
- TypeScript project dependency: 6.0.3
- Vitest project dependency: 4.1.10
- NestJS API dependencies: 11.1.28
- NestJS CLI project dependency: 11.0.24
- Supertest API test dependency: 7.2.2
- SWC test transformer: 1.15.46 through unplugin-swc 1.5.9
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

Review and commit the executable NestJS API bootstrap and build configuration.

## Next task

Define a one-channel current-program API contract that combines authoritative server time, a static looping playlist, and the existing playlist resolver.

## First implementation milestone

Build the smallest synchronization experiment:

- one channel;
- two short HLS fixtures;
- deterministic schedule calculation;
- a unit test using a controlled clock;
- two-browser synchronization verification.
