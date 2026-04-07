# Project Structure (Onboarding)

This repository is a monorepo with two deployable apps and three shared packages.

## Top-Level Layout

```text
bitsio-aiops-platform/
  apps/
    web/                # Next.js dashboard UI (Vercel target)
    server/             # Fastify BFF API (Render/Railway target)
  packages/
    domain/             # Core models, protocols, use-cases
    ai/                 # LLM gateway, providers, prompts
    telemetry/          # Scenario repository and telemetry generators
  scripts/              # Smoke checks and env validation
  docs/                 # Deployment/runbooks/roadmaps
```

## Request/Data Flow

1. `apps/web` calls `apps/server` API.
2. `apps/server` uses `packages/domain` use-cases and `packages/telemetry` scenarios.
3. AI calls route through `packages/ai` gateway and provider adapters.
4. Timeline is returned as full sequence; frontend streams step-by-step.

## Naming Conventions

- `*-panel.tsx` = dashboard section components.
- `*-service.ts` = server orchestration logic.
- `*-provider.ts` = concrete LLM provider adapter.
- `*.test.ts` = unit tests colocated by package/app.

## Where To Add New Code

- New UI panel: `apps/web/components/<feature>/`.
- New API route: `apps/server/src/routes/`.
- New AI provider/prompt: `packages/ai/src/providers|prompts/`.
- New scenario: `packages/telemetry/src/scenarios/`.
