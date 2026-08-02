# TV Broadcast Project Brief

## Project metadata

- Repository: https://github.com/brickly26/tv-Broadcast
- Primary purpose: hands-on system-design and application-development practice

## Vision

TV Broadcast is a web-based set-top-box experience. It provides programmed channels that viewers can switch between, with every viewer on a channel watching the same program at approximately the same point in time.

## Learning goals

- Design a video-processing pipeline.
- Build a distributed asynchronous job system.
- Learn automated testing from first principles.
- Improve Docker and container-based development skills.
- Practice production-style Git, CI, observability, and documentation workflows.

## First complete version

### Viewer experience

- Three channels.
- Channel-up, channel-down, and direct channel selection.
- Continuously programmed playback.
- Server-authoritative linear playback through a small rolling HLS window.
- No viewer-controlled seeking into unpublished content.
- Pause and rewind are limited to media that remains in the published rolling window.
- Viewers remain synchronized within two seconds.
- Current and next program information.

### Administration

- Upload an original video file.
- View processing status and failures.
- Add processed videos to channel playlists.
- Reorder playlist items.
- Apply playlist changes to a channel.

### Video pipeline

- Validate an uploaded file.
- Inspect it with FFprobe.
- Generate a thumbnail.
- Transcode it to at least two resolutions.
- Package the renditions as HLS.
- Store the completed output privately so reusable segments can be published into channel streams at broadcast time.

### Job processing

- Asynchronous workers.
- Configurable retry attempts.
- Exponential backoff.
- Idempotent processing.
- Permanent failures placed in a dead-letter queue.
- Administrative retry of dead-lettered jobs.

## Initial non-goals

- True live camera or RTMP input.
- Sub-second synchronization.
- DRM.
- Advertising.
- Recommendations.
- Multiple administrators or organizations.
- Native television or mobile applications.
- Automated downloading from YouTube.
- Production support for 15 channels during the first milestone.

## Security model

The detailed trust boundaries and negative-test matrix are maintained in `docs/SECURITY.md`.

- The server-authoritative channel timeline decides which segment sequences are currently published.
- A viewer receives a rolling live manifest containing only already-published segments within a bounded window.
- Complete VOD manifests, original uploads, internal rendition paths, future segments, and expired segments are not available through the public viewer path.
- Direct requests for guessed media identifiers must pass the same publication check as requests discovered through a manifest.
- Production object storage is private by default. Later CDN delivery must preserve the publication decision at the edge or through narrowly scoped, short-lived capabilities.
- Public channel, program, and media identifiers identify resources; possession or discovery of an identifier does not grant access.
- Cache behavior must not preserve access to unpublished or expired media. The first implementation uses non-cacheable API responses until a secure edge-delivery design is introduced.
- This model limits access to content that has not yet aired. It does not prevent a viewer from recording or copying bytes their browser has already received and is not a DRM system.

## Success criteria

Two independent browser sessions can tune to the same channel, consume the server-published live edge, and remain within two seconds of one another. A viewer cannot retrieve a complete VOD manifest, a future segment, or a segment that has expired from the configured rolling window, even by requesting a guessed URL directly. An uploaded source video can be processed into reusable HLS segments, stored privately, added to a looping channel playlist, and broadcast without real-time transcoding.
