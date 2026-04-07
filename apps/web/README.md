# `@bitsio/web` Structure Guide

This app is organized by responsibility so new contributors can find code quickly.

## Folder Map

```text
apps/web
  app/                  # Next.js App Router entrypoints (`layout.tsx`, `page.tsx`)
  application/          # Use-case layer + gateway ports
    create-aiops-usecases.ts
    ports/              # Interfaces that app logic depends on
  components/           # Reusable UI by feature area
    copilot/            # AI chat panel
    observability/      # Logs, metrics, trace panels
    scenarios/          # Quick-access scenario selector
    timeline/           # Timeline rendering panel
  domain/               # Frontend domain models (`session.ts`)
  hooks/                # React hooks (`use-auth-session`)
  infra/                # Infrastructure adapters
    http/               # HTTP gateway implementation for backend API
  lib/                  # Browser/session/runtime utilities
  store/                # Zustand state container
  types/                # Shared frontend API/domain types
```

## Contributor Rules

- Keep `app/page.tsx` as composition-only (wire data + handlers, minimal business logic).
- Put reusable business logic in `application/`, `hooks/`, or `store/`.
- Keep network calls behind `application/ports` and `infra/http`; do not call `fetch` directly in components or store.
- Keep presentational panels under `components/*` and pass typed props.
