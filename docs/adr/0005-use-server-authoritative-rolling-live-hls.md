# ADR 0005: Use Server-Authoritative Rolling Live HLS

- Status: Accepted
- Date: 2026-08-01

## Context

The first playback prototype exposed a complete prerecorded HLS manifest and raw asset segment URLs, then told the browser which offset to seek to. That proved the schedule, API, media, and browser could work together, but it made the browser responsible for respecting the broadcast position.

A viewer could inspect the VOD manifest, request later segments directly, or seek into content that had not aired. Hiding controls or URLs cannot prevent this because the browser and viewer control client-side requests.

The product needs linear, looping channels with viewers within two seconds of one another. It does not need real-time transcoding of prerecorded content, and it does not claim DRM protection for bytes already delivered.

## Decision

Keep preprocessing each asset into reusable HLS segments. Keep the epoch-anchored looping playlist from ADR 0002 as the authoritative channel timeline.

Replace full VOD delivery and client-authoritative seeking with a server-generated rolling live media playlist. The browser receives only a bounded window of channel segment sequences that the server has published.

The initial public routes are:

```text
GET /api/channels/:channelId/live/index.m3u8
GET /api/channels/:channelId/live/segments/:sequence.ts
```

Channel sequences are monotonically increasing positions on the continuous broadcast timeline, even when the underlying asset playlist loops. A public channel's epoch is configured in the past so viewer-visible HLS media-sequence values are nonnegative. Public routes do not expose private asset paths or use an asset identifier as proof of access.

For the initial implementation, a segment becomes publishable when its scheduled interval has fully ended according to authoritative server time. This keeps the delivered live edge at least one media segment behind the mathematical channel position and avoids exposing bytes assigned to an unfinished future interval. The initial rolling window contains the six most recently completed segments and is configurable.

On every manifest and segment request, the API computes the eligible rolling window. A segment is served only if it maps to the requested channel, has reached its publication time, and has not expired from that window. Future, expired, unknown, and wrong-channel sequences return `404`.

The initial implementation proxies eligible bytes through NestJS and sends `Cache-Control: no-store` for both live manifests and segments. Complete VOD manifests, raw asset segment routes, originals, and renditions remain private and are not viewer endpoints.

Production object storage is private by default. Moving delivery to a CDN requires another decision that demonstrates equivalent enforcement through edge authorization or narrowly scoped, short-lived capabilities. Cache lifetimes must not outlive publication eligibility.

The current-program endpoint may continue to expose interface metadata, but it must not grant media access or return private VOD locations. The browser follows the channel live manifest rather than seeking into a program asset.

## Security boundary

The publication decision is enforced outside viewer-controlled code. Hidden controls, unlisted URLs, JavaScript checks, and guess-resistant identifiers are not part of the authorization model.

Public knowledge of a channel, program, or sequence does not make its media retrievable. Negative tests directly request guessed future, expired, wrong-channel, and internal-media URLs.

This decision prevents viewers from skipping ahead into unpublished media and bounds rewind to the retained window. It cannot prevent recording or copying a segment after authorized delivery; that is a DRM problem and remains out of scope.

## Consequences

### Benefits

- Future content is unavailable at the delivery boundary, not merely hidden in the interface.
- All viewers follow the same server-published live edge.
- Existing preprocessing and reusable segments avoid a continuously running encoder.
- A dynamic manifest can be generated deterministically from the channel clock without a publisher daemon in the first version.
- A small rolling window bounds pause and rewind naturally.

### Costs and limitations

- The server must maintain exact segment metadata and map continuous channel sequences across program and loop boundaries.
- Every segment request needs a publication decision, increasing API work until a secure edge design is introduced.
- `no-store` sacrifices CDN efficiency in the first implementation in favor of an unambiguous access model.
- Publishing only completed intervals adds at least one segment of latency behind the mathematical channel position.
- Playlist edits still require a future transition rule that preserves a stable active timeline.
- This is not DRM and cannot revoke bytes already delivered to a viewer.

## Alternatives considered

- Continue serving complete VOD manifests and rely on client seeking.
- Hide future URLs or disable player controls.
- Run a continuous encoder for every prerecorded channel.
- Make the object-storage bucket public and use obscure object keys.
- Issue long-lived signed URLs for underlying assets.
- Introduce an always-running publisher process before the deterministic request-time model has been validated.
