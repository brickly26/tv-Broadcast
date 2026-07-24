# ADR 0003: Use NestJS for the API

- Status: Accepted
- Date: 2026-07-23

## Context

The API needs to support channels, playlists, uploads, current-program resolution, administrative workflows, PostgreSQL, and Redis-backed job submission. The project should also demonstrate backend skills that are recognizable to employers.

The developer is already experienced with JavaScript and TypeScript. Keeping the API and video worker in the Node.js ecosystem preserves direct BullMQ integration and avoids expanding the first version into a cross-language queue architecture.

## Decision

Use NestJS with its default Express adapter for the HTTP API.

Keep the video-processing worker as a separate plain Node.js and TypeScript process. Keep framework-independent domain logic, such as looping-playlist calculations, in reusable workspace packages rather than coupling it to NestJS.

## Consequences

### Benefits

- The project demonstrates a structured TypeScript backend with modules, controllers, providers, dependency injection, and testing.
- NestJS integrates with the planned PostgreSQL, Redis, and BullMQ stack.
- The API and worker can share TypeScript types and domain packages.
- The framework is recognizable while the project's distinctive system-design work remains visible.

### Costs and limitations

- NestJS introduces decorators, dependency injection, and framework conventions that must be learned.
- Its abstraction layer can hide some underlying HTTP behavior unless those concepts are taught explicitly.
- The framework adds more structure and dependencies than a minimal Express or Fastify application.

## Alternatives considered

- Fastify as a lightweight TypeScript API framework.
- Express without an application framework.
- Java with Spring Boot.
- C# with ASP.NET Core.
- Python with FastAPI or Django.
- Go with the standard HTTP library or a lightweight framework.
