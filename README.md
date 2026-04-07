# bitsIO AIOps Platform

Production-ready AIOps web platform for bitsIO Inc. with AI-driven observability, timeline-based decision intelligence, multi-LLM routing, Firebase auth, and deploy-ready frontend/backend separation.

## Highlights

- Next.js 14 App Router frontend (`apps/web`) with Tailwind + Zustand + Recharts
- Fastify TypeScript BFF (`apps/server`) with secure LLM proxying
- Clean architecture shared packages (`packages/domain`, `packages/ai`, `packages/telemetry`)
- Timeline engine that streams steps client-side in O(n) without blocking loaders
- JSON-driven scenario engine with realistic logs/metrics/traces
- Multi-provider LLM abstraction:
  - Ollama (dev)
  - OpenRouter (prod)
  - Gemini (fallback)
  - Heuristic local fallback for demo reliability
- Prompt guardrails and lightweight TTL caching for stable demo latency/cost
- Request ID propagation (`x-request-id`) and standardized API error payloads
- Firebase magic-link auth + guest mode
- Firestore integration points for sessions and audit logs

## Monorepo Structure

```text
/apps
  /web
  /server
/packages
  /domain
  /ai
  /telemetry
/docs
```

Detailed onboarding maps:

- `apps/web/README.md`
- `apps/server/README.md`
- `docs/architecture/project-structure.md`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` at repo root from `.env.example`.

3. Validate env setup before running:

```bash
npm run check:env
```

4. Run development stack:

```bash
npm run dev
```

- Web: `http://localhost:3000`
- Server: `http://localhost:8080`

## Required Environment Variables

Use root `.env.example` as the source of truth.

Core variables:

- `APP_MODE` (`local-demo` for local, `production` for CTO/public URL)
- `NEXT_PUBLIC_APP_MODE` (`local-demo` locally, `production` in Vercel production)
- `NEXT_PUBLIC_API_BASE_URL`
- `LLM_RUNTIME` (`ollama` for local, `openrouter` for production)
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY` (fallback)
- Firebase public keys (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase Admin keys (`FIREBASE_*`) when Firestore persistence is enabled

## Scenario Buttons

- `✨ AIOps Trace`
- `📊 Maturity Assessment`
- `🏦 Financial Services`

Each scenario loads mock observability telemetry and executes:

1. Trigger
2. Context Retrieval
3. Reasoning
4. Policy Check
5. Action Execution
6. Outcome

## Testing and Quality

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run smoke:server
npm run check:env
```

Unit tests include:

- Timeline builder (`packages/domain/tests/build-timeline.test.ts`)
- LLM gateway fallback behavior (`packages/ai/tests/llm-gateway.test.ts`)

## Deployment

### Frontend (Vercel)

1. Import repo in Vercel.
2. Set project root to `apps/web`.
3. Set build command: `npm run build -w @bitsio/web`.
4. Set output mode to Next.js default.
5. Add env vars:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend>.onrender.com`
   - Firebase `NEXT_PUBLIC_FIREBASE_*`
6. Deploy and obtain public URL:
   - `https://<your-app>.vercel.app`

### Backend (Render)

Option A: Use `render.yaml` in repo root.

Option B: Manual setup:

1. Create new Web Service on Render.
2. Root directory: repository root.
3. Build command:
   - `npm install && npm run build -w @bitsio/server`
4. Start command:
   - `npm run start -w @bitsio/server`
5. Add env vars:
   - `NODE_ENV=production`
   - `LLM_RUNTIME=openrouter`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (recommended: `openai/gpt-4o-mini`)
   - `CORS_ORIGIN=https://<your-app>.vercel.app`
   - Optional Firebase admin vars for Firestore persistence

## Demo Flow (CTO-ready)

1. Open frontend public URL.
2. Click one of the quick access scenarios.
3. Observe logs, metrics, traces, and streamed timeline.
4. Ask Copilot:
   - "What happened?"
   - "Why?"
   - "What should we do?"

## Cost Notes

- Works on free tiers (Vercel + Render free plans).
- Recommended low-cost model for OpenRouter:
  - `openai/gpt-4o-mini`
- Estimated LLM spend target remains under `$20/month` for demo traffic.
- In `local-demo` mode, auth and cloud-provider quota usage are disabled by default.

## CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Runs on push/PR:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## Handoff Docs

- Implementation status and pending roadmap:
  - `docs/handoff-roadmap.md`
- Agent continuation prompt:
  - `docs/agentic-master-prompt.md`
- Deployment readiness checklist:
  - `docs/deployment/cto-demo-checklist.md`
- Demo playbook (real-world scenarios + talk track):
  - `docs/demo/real-world-demo-playbook.md`
- Scenario test commands:
  - `docs/demo/scenario-test-commands.md`
