# TV Broadcast Project Status

## Current phase

Phase 0 — Foundation

## Repository

https://github.com/brickly26/tv-Broadcast

## Completed decisions

- Working name: TV Broadcast
- TypeScript stack
- Three-channel first version
- Eventually 10–15 channels
- Scheduled pseudo-live HLS
- Original-file uploads
- Looping channel schedules
- Public viewers and one administrator
- Synchronization target within two seconds
- Testing included throughout development

## Developer experience

- TypeScript: 3–4
- React: 3–4
- Backend APIs: 3–4
- SQL: 3–4
- Docker: 2–3
- Automated testing: 0–1

Guidance should move quickly through familiar application-development concepts while explaining Docker and testing carefully.

## Last completed milestone

The read-only local development environment inventory was completed on 2026-07-22.

## Development environment inventory

- Node.js: v22.16.0, managed under NVM
- npm: 11.4.2
- Corepack: installed
- pnpm: not installed
- Yarn: not installed
- Git: 2.50.1 (Apple Git-155)
- FFmpeg: 7.1.1
- FFprobe: 7.1.1
- Docker client and engine: 28.4.0
- Docker Compose: v2.39.2-desktop.1
- Local project folder: initialized as a Git repository on the `main` branch
- GitHub repository: reachable but empty, with no branches, tags, commits, or HEAD
- Local Git remote: `origin` points to https://github.com/brickly26/tv-Broadcast.git for fetch and push

## Current task

Review the untracked project-memory files and create the initial repository baseline.

## Next task

Choose the package manager and create the minimal project structure for the synchronization vertical slice.

## First implementation milestone

Build the smallest synchronization experiment:

- one channel;
- two short HLS fixtures;
- deterministic schedule calculation;
- a unit test using a controlled clock;
- two-browser synchronization verification.
