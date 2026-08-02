# TV Broadcast Security Model

## Goal

Prevent a public viewer from retrieving channel media before it has been published or after it has expired from the rolling window. Keep administrative operations and private processing artifacts outside the public viewer trust boundary.

This is not DRM. A viewer can record or copy media bytes after the application legitimately delivers them.

## Protected assets

- Original uploads.
- Transcoded renditions and internal validation manifests.
- Reusable HLS segments before and after their allowed broadcast window.
- Administrative playlist and processing operations.
- Private object-storage locations and credentials.

Program titles, channel identifiers, and current/next program metadata may be public, but they do not authorize media access.

## Trust boundaries

- The browser is untrusted. Its clock, JavaScript, player controls, requested URL, and requested sequence may be manipulated.
- NestJS is the initial publication enforcement point and uses the server clock.
- Object storage is private and trusts only application or worker credentials.
- A future CDN is trusted only after it can enforce equivalent publication and expiry rules.
- FFmpeg workers may write private artifacts but do not make viewer-publication decisions.

## Viewer media rules

- Only channel-sequence routes are public playback routes.
- Every segment request is checked independently; appearing in an earlier manifest is not permanent authorization.
- A segment is eligible only after its scheduled interval ends and while it remains inside the configured rolling window. The initial window contains the six most recently completed segments.
- Future, expired, unknown, and wrong-channel sequences receive `404`.
- Viewer responses never reveal original paths, private object keys, complete VOD manifests, or stable origin URLs.
- Initial manifest and segment responses use `Cache-Control: no-store`.

## Required negative tests

| Boundary | Required proof |
| --- | --- |
| Future publication | A guessed next sequence returns `404` before its publish time. |
| Exact publish time | The same sequence becomes available exactly at its defined boundary. |
| Window expiry | A formerly available sequence returns `404` after leaving the window. |
| Channel isolation | A sequence valid for one channel cannot be fetched through another channel. |
| Unknown media | Unknown channels and sequences return `404` without revealing private details. |
| Raw assets | Original files, VOD manifests, rendition paths, and raw fixture segments have no public viewer route. |
| Manifest disclosure | A live manifest contains no future sequence or private asset locator. |
| Cache behavior | Response headers and later CDN tests prove cached responses cannot outlive access eligibility. |
| Administration | Public viewers cannot perform upload, playlist, replay, or publication mutations. |

## Review rule

Any milestone that changes media delivery, caching, storage, uploads, administrative access, or authentication must update this threat model or explicitly confirm that its assumptions still hold. Security acceptance criteria and at least one relevant negative test are defined before implementation.
