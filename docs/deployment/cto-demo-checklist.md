# CTO Demo Readiness Checklist

Run this checklist before sharing the public URL.

## 1. Environment Validation

Local file-based check:

```bash
npm run check:env
```

Production env check (CI/host process env):

```bash
npm run check:env:prod
```

## 2. Quality Gate

```bash
npm run verify
```

## 3. Runtime Smoke Test

Start server:

```bash
npm run build -w @bitsio/server
node apps/server/dist/index.js
```

In another terminal:

```bash
BASE_URL=http://localhost:8080 npm run smoke:server
```

Expected checks:

- `health status=ok`
- `scenarios scenarios=3`
- `run-scenario timelineSteps=6`
- `copilot copilot=ok`

## 4. Cloud Config

- Vercel (`apps/web`): set all `NEXT_PUBLIC_*` vars and `NEXT_PUBLIC_API_BASE_URL`.
- Render/Railway (`apps/server`): set runtime provider vars and API keys.
- Ensure `CORS_ORIGIN` includes deployed Vercel URL.

## 5. Demo Script Sanity

- Open app URL.
- Click `✨ AIOps Trace`.
- Confirm timeline streams without spinner.
- Ask Copilot:
  - `What happened?`
  - `Why?`
  - `What should we do?`
