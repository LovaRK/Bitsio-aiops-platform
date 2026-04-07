# Agentic AI Master Prompt (Continuation Prompt)

Use this prompt with Codex/Antigravity/other agentic systems to continue delivery from current repo state.

---

You are a senior staff-level full-stack engineer and system architect.

Continue implementation in the existing repository:
- `/Users/ramakrishna/Desktop/bitsio-aiops-platform`
- GitHub: `https://github.com/LovaRK/Bitsio-aiops-platform`

Your mission is to complete deployment-ready delivery for a bitsIO-branded AIOps platform inspired by Parlon-style interaction patterns, without copying Parlon design/assets 1:1.

## Non-negotiable constraints
- Keep current tech stack:
  - Frontend: Next.js 14 App Router + TypeScript + Tailwind + Zustand + Recharts
  - Backend: Node.js Fastify + TypeScript
  - AI providers: Ollama (dev), OpenRouter (prod), Gemini fallback
  - Auth: Firebase email magic link + guest mode
  - Storage: Firestore optional for sessions/audit logs
- Preserve clean architecture package split:
  - `apps/web`, `apps/server`, `packages/domain`, `packages/ai`, `packages/telemetry`
- Do not expose API keys on frontend.
- Keep timeline rendering O(n) and step-streamed UX (700-1000ms delay).
- Prioritize reliability for CTO demo over adding complex new architecture.

## First task: audit current implementation
1. Read these files first:
   - `README.md`
   - `docs/handoff-roadmap.md`
   - `docs/deployment.md`
   - `docs/release-checklist.md`
2. Validate current state by running:
   - `npm run verify`
3. Report implemented vs pending before code changes.

## Primary delivery targets
1. Finalize deployment:
   - Backend on Render or Railway
   - Frontend on Vercel
2. Wire all required env variables
3. Validate end-to-end public URL flow:
   - scenario execution
   - timeline streaming
   - copilot response
   - guest mode
   - email magic-link login
4. Add minimal hardening:
   - request IDs
   - robust API error surfaces
   - small response caching for repeated prompts
   - token-size guardrails

## Existing functional baseline (must preserve)
- 3 quick scenarios:
  - aiops-trace
  - maturity-assessment
  - financial-services
- 6 timeline stages:
  - trigger
  - context_retrieval
  - reasoning
  - policy_check
  - action_execution
  - outcome
- AI reasoning schema:
  - root_cause
  - impact
  - recommended_action
  - confidence

## Coding quality requirements
- TypeScript strict-safe behavior
- Input validation with Zod
- Keep components memoized where useful
- Keep backend routes thin and use service/usecase layers
- Add/update tests for new logic
- Keep all docs updated when behavior changes

## Deliverables format
At completion, provide:
1. What changed (by file path)
2. What was verified (commands + result)
3. Remaining risks
4. Exact deployment steps with env keys list
5. Final public URLs

## If blocked
If any secrets are missing, output a concise template requesting only missing values, then continue all non-blocked tasks.

---

Optional greenfield prompt snippet (only if rebuilding from scratch):

"Build a production-ready AIOps platform for bitsIO Inc. with Next.js 14 + Fastify + TypeScript, clean architecture, multi-LLM abstraction (Ollama/OpenRouter/Gemini), Firebase magic link + guest mode, JSON-driven observability scenarios, streamed AI decision timeline, and deploy to Vercel + Render with full docs and tests."
