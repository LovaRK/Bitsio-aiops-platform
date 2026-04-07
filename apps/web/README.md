# `@bitsio/web` Structure Guide

This app is organized by responsibility so new contributors can find code quickly.

## Folder Map

```text
apps/web
  app/                  # Next.js App Router entrypoints (`layout.tsx`, `page.tsx`)
  components/           # Reusable UI by feature area
    copilot/            # AI chat panel
    observability/      # Logs, metrics, trace panels
    scenarios/          # Quick-access scenario selector
    timeline/           # Timeline rendering panel
  hooks/                # React hooks (`use-auth-session`)
  lib/                  # API clients + browser/session utilities
  store/                # Zustand state container
  types/                # Shared frontend API/domain types
```

## Contributor Rules

- Keep `app/page.tsx` as composition-only (wire data + handlers, minimal business logic).
- Put reusable business logic in `hooks/`, `lib/`, or `store/`.
- Add all network calls under `lib/api.ts`; do not call `fetch` directly in components.
- Keep presentational panels under `components/*` and pass typed props.
