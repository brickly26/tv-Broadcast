# ADR 0002: Use Epoch-Anchored Looping Playlists

- Status: Accepted for channel timing; delivery amended by ADR 0005
- Date: 2026-07-23

## Context

The intended product is a small set of television-like channels. Each channel contains an ordered playlist of prerecorded videos that repeats continuously. The initial product does not need premieres, programs that begin at specific wall-clock times, draft schedule versions, or future activation boundaries.

Viewers still need a shared timeline so that everyone tuning into the same channel sees approximately the same video position.

## Decision

Give each channel an ordered playlist and a shared playback epoch. Treat the epoch as the phase anchor for an indefinitely repeating cycle, not as a premiere or activation time.

Calculate the channel position from authoritative server time:

```text
cycle duration = sum of playlist item durations
elapsed time = server time - playback epoch
cycle offset = positive modulo(elapsed time, cycle duration)
```

Resolve the video and its playback offset by walking the ordered playlist. Positive modulo makes the cycle well-defined on either side of the chosen epoch.

The first synchronization vertical slice uses a static playlist. The behavior for applying playlist edits to an active channel will be decided with the administrative workflow.

ADR 0005 uses this calculation as the authoritative channel timeline but no longer sends the resolved asset and offset to the browser for VOD seeking. The server instead maps the timeline to a rolling window of published channel segments.

## Consequences

### Benefits

- The model directly matches continuously looping channels.
- No program-specific wall-clock schedule is required.
- The server can derive a deterministic channel position and publication window from shared time without a continuously running encoder.
- The core calculation remains deterministic and easy to unit test.

### Costs and limitations

- Accurate processed-video durations are required.
- Playlist changes can alter the total cycle duration and need an explicit transition rule later.
- Timed premieres and event programming are not supported by the initial model.

## Alternatives considered

- Immutable schedule versions activated at future boundaries.
- A continuously running live encoder for each channel.
- Independent per-viewer playlist playback beginning at tune-in time.
