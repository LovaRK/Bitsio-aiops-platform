# `@bitsio/server` Structure Guide

Fastify BFF follows a light clean-architecture separation.

## Folder Map

```text
apps/server/src
  config/               # Environment parsing and runtime config
  routes/               # HTTP route registration (transport layer)
  services/             # Application services/use-case orchestration
  utils/                # Shared server utilities (errors, guards, cache)
```

## Contributor Rules

- Keep `routes/*` thin: validate/request-shape and delegate to services.
- Keep LLM prompting, policy logic, and telemetry decisions in services or shared packages.
- Throw `AppError` for expected failures so API responses stay standardized.
- Add unit tests for utility logic and non-trivial service behavior.
