# ADR 0001: Use Scheduled Pseudo-Live HLS

- Status: Accepted
- Date: 2026-07-21

## Context

TV Broadcast needs multiple linear channels where every viewer tuning into a channel sees the same program at approximately the same playback position.

A continuously running encoder and live stream for every channel would provide linear playback, but it would add operational cost and complexity before the project needs true live input. Serving ordinary video-on-demand files without a shared schedule would be simpler, but viewers would begin each video at different positions.

## Decision

Process prerecorded source videos into HLS video-on-demand assets. Store an authoritative, server-time-based schedule for each channel. When a viewer tunes in, resolve the current program and expected playback offset from that schedule, load the program's HLS manifest, and seek to the expected offset.

Published schedule versions are immutable. Changes are made in a draft and activated at a defined future boundary.

The first synchronization target is a maximum two-second difference between viewers under normal conditions.

## Consequences

### Benefits

- Media can be processed before broadcast and served through ordinary object storage and a CDN.
- No continuously running encoder is required for every channel.
- Viewers can switch channels and join the shared timeline at any time.
- The architecture exercises scheduling, time synchronization, video processing, and distributed job processing.

### Costs and limitations

- Clients must measure and correct clock and playback drift.
- Program transitions need careful handling.
- This does not initially support live camera or RTMP sources.
- Playlist publication must preserve a stable timeline for active viewers.

## Alternatives considered

- Run a continuous live encoder for every channel.
- Embed YouTube players and coordinate their playback positions.
- Start every selected video from the beginning for each viewer.

