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
- No viewer-controlled seeking.
- Viewers remain synchronized within two seconds.
- Current and next program information.

### Administration

- Upload an original video file.
- View processing status and failures.
- Add processed videos to channel playlists.
- Reorder playlist items.
- Publish a new channel schedule.

### Video pipeline

- Validate an uploaded file.
- Inspect it with FFprobe.
- Generate a thumbnail.
- Transcode it to at least two resolutions.
- Package the renditions as HLS.
- Publish the completed output to object storage.

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

## Success criteria

Two independent browser sessions can tune to the same channel and remain within two seconds of one another. An uploaded source video can be processed, published, scheduled, and played without manual media conversion.

