# ADR 0004: Bundle private workspace packages into deployable applications

- Status: Accepted
- Date: 2026-07-24

## Context

The NestJS API depends on framework-independent scheduling logic from the private `@tv-broadcast/scheduling` workspace package. Vitest and TypeScript can consume that package's TypeScript source directly, but an unbundled API build leaves a runtime package import. Node.js cannot execute the package's TypeScript-only entry point as ordinary JavaScript.

The repository could either build every internal package independently or bundle private package source into each deployable application.

## Decision

Keep private internal workspace packages source-based and bundle their source into deployable applications.

Use the Nest CLI with Webpack and `ts-loader` for the API. Keep `moduleResolution: "Bundler"` explicit in the shared TypeScript configuration. Continue running `tsc --noEmit` separately for static type checking and Vitest with SWC for tests.

Keep adapter-specific optional dependencies out of the application when their adapter is not used. The API's custom Webpack configuration ignores the optional `@fastify/static` import exposed by `@nestjs/serve-static` because this application uses Express.

The separate video worker will own its build configuration when introduced. Any workspace package that later needs to be published or executed independently must gain a dedicated compiled-package build instead of relying on this decision.

## Consequences

### Benefits

- The API produces one runtime bundle containing its internal scheduling dependency.
- A clean checkout does not need a separately built scheduling package before the API can run.
- Shared domain logic remains framework-independent and is not duplicated inside the API.
- Tests, type checking, and runtime bundling retain distinct and explicit responsibilities.

### Costs and limitations

- The API build requires Webpack and `ts-loader` in addition to the test transformer.
- Build configuration must allow source files from multiple workspace directories.
- Bundled framework packages may require explicit handling for optional adapter dependencies.
- Private source packages are not directly executable or publishable artifacts.
- Each future deployable process must bundle shared source or adopt a dedicated package-build workflow.

## Alternatives considered

- Compile every workspace package independently and enforce build ordering.
- Publish compiled internal packages to a package registry.
- Move or duplicate scheduling logic inside the API.
