# TV Broadcast — Collaboration Instructions

## Project purpose

Build a web application that behaves like linear broadcast television. Viewers switch between scheduled channels, and everyone watching a channel sees the same program at approximately the same position.

The project is also a learning exercise in video processing, distributed job queues, automated testing, Docker, and production engineering.

## Working agreement

- The user is the primary developer and writes the implementation.
- Explain concepts and small implementation steps before providing code.
- Use a guided-learning rhythm: build intuition first, ask the user to predict behavior or implement bounded pieces, review their attempt, and provide hints before a full solution when practical.
- Avoid long stretches of copy-only implementation; include occasional small challenges that let the user apply the concept independently.
- Prefer coherent batches containing several closely related behaviors and their tests over advancing one assertion at a time, but slow down and provide a worked example when a batch introduces an unfamiliar API, testing technique, or architectural pattern. The user will interrupt when they want additional depth.
- Do not create, edit, delete, install, or run mutating commands unless the user explicitly requests that exact action, except for maintaining the persistent project-memory documents as described below.
- Read `docs/STATUS.md` and `docs/SECURITY.md` before continuing work in a new session.
- Keep tasks small enough to understand and test independently.
- Every feature must include an appropriate testing discussion.
- Every feature that touches media delivery, uploads, administration, storage, caching, or authentication must define security acceptance criteria and negative tests before implementation.
- Do not treat hidden controls, unlisted URLs, client-side JavaScript, or public media identifiers as access control.
- Prefer teaching and review over silently implementing a solution.
- Codex is responsible for maintaining the persistent project-memory documents in `AGENTS.md` and `docs/` so the user can focus on implementation.
- Update `docs/STATUS.md` after meaningful progress, and update architecture documents or ADRs when an architectural decision is explicitly accepted. These documentation updates do not authorize implementation changes.
- Keep the remote repository current: after each completed milestone, or at most two tightly related green implementation batches, run the full verification suite, review the diff, and prompt the user to commit and push a coherent checkpoint. Do not commit or push on the user's behalf without explicit permission.

## Approved technical direction

- TypeScript
- React with Vite
- NestJS API with its default Express adapter
- PostgreSQL
- Redis and BullMQ
- Separate Node.js video worker
- FFmpeg and FFprobe
- HLS video delivery
- S3-compatible object storage
- Docker Compose
- Vitest, Playwright, Testcontainers, and later k6

## Product constraints

- Begin with three channels; eventually support 10–15.
- Viewers are public; administration is initially single-user/local.
- Channels use continuously looping playlists anchored to shared server time; wall-clock premieres and future schedule activation are not part of the initial product.
- Viewer playback uses a server-authoritative rolling live HLS window. Complete VOD manifests and unpublished or expired segments are not exposed through the viewer path.
- Preprocessed source media and production media storage are private by default. Publication eligibility is enforced by the server, storage layer, or delivery layer on every media request.
- Viewers should be synchronized within two seconds.
- Preventing access to unpublished content is a product requirement; preventing recording of media already delivered to a viewer is not. The project does not claim DRM protection.
- Original video files are uploaded directly.
- YouTube URLs may be stored as metadata, but the application will not download YouTube videos.
