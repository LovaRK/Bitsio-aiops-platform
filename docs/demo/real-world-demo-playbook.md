# BitsIO AIOps Real-World Demo Playbook

Use this as the primary document for live demos and validation.

## 1. Demo Goal

Show that BitsIO can:

1. detect incident signals from logs + metrics + traces,
2. generate explainable AI reasoning,
3. present a decision timeline (`trigger -> context -> reasoning -> policy -> action -> outcome`),
4. guide operators with recommended actions.

## 2. Modes To Demo

### Local demo mode (developer-safe)

- No Firebase auth required.
- No cloud quota usage.
- Provider path: local providers only (`ollama` then local fallback).
- Best for internal testing and rehearsal.

### Production mode (CTO/public URL)

- Firebase auth enabled.
- Cloud provider quota enabled (OpenRouter/Gemini as configured).
- Firestore persistence optional.

## 3. Real-World Scenarios (Current App)

### Scenario A: `aiops-trace` (Payment latency spike)

- Business context: checkout failures and customer drop-off risk.
- Core symptoms:
  - `payment-api` p95 latency spikes to ~2100ms
  - error rate rises to ~34%
  - trace failures + DB pool timeout logs
- Demo message:
  - "The system correlates service saturation and retry storms, then recommends stabilization actions before SLO breach worsens."

### Scenario B: `maturity-assessment` (Reliability posture)

- Business context: platform reliability and automation readiness.
- Core symptoms:
  - `platform-gateway` degradation
  - circuit breaker activity
  - fallback routing and peer resets
- Demo message:
  - "This is not only incident response, it is operational maturity scoring and policy-aware next-step guidance."

### Scenario C: `financial-services` (Fraud model drift)

- Business context: false positives, settlement delay, compliance risk.
- Core symptoms:
  - `fraud-api` latency + error increase
  - model confidence entropy warning
  - ledger settlement lock wait timeout
- Demo message:
  - "BitsIO explains AI/model-health impact on transaction flow and recommends compliant mitigation."

## 4. Pre-Demo Validation (5 minutes)

Run from repo root:

```bash
npm run verify
BASE_URL=http://localhost:8080 npm run smoke:server
```

Start app:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## 5. Live Demo Script (10–12 minutes)

### Step 1: Positioning (1 minute)

Say:

- "This is BitsIO's AI-powered observability and decision intelligence cockpit."
- "We unify telemetry and generate explainable action timelines."

### Step 2: AIOps Trace run (3 minutes)

1. Click `✨ AIOps Trace`.
2. Point to:
   - metrics spike,
   - error logs,
   - degraded/failed traces.
3. Highlight timeline streaming sequence.
4. Explain policy verdict and action recommendation.

Say:

- "The AI is not just answering; it is showing each decision checkpoint."

### Step 3: Financial scenario (3 minutes)

1. Click `🏦 Financial Services`.
2. Emphasize model drift + queue/ledger impact.
3. Open Copilot and ask:
   - "What happened?"
   - "Why is this risky?"
   - "What should we do in the next 15 minutes?"

Say:

- "This is aligned to regulated workflows: explainability + policy guardrails."

### Step 4: Maturity scenario (2 minutes)

1. Click `📊 Maturity Assessment`.
2. Explain this as readiness/operating-model analysis.

Say:

- "Same engine supports both incident response and operations maturity journeys."

### Step 5: Close (1–2 minutes)

Say:

- "In production mode, this connects to cloud LLM + Firebase auth and can be deployed for executive access via URL."

## 6. Copilot Prompt Bank (Recommended)

Use these live:

1. "Summarize this incident in one paragraph for an operations manager."
2. "What is the probable root cause and confidence?"
3. "What action should we take now, and what should we monitor after action?"
4. "What is the rollback condition?"
5. "Draft a stakeholder update in plain language."

## 7. Expected Demo Outcomes

For each scenario, confirm:

1. Timeline contains exactly 6 stages.
2. Reasoning block includes:
   - root cause
   - impact
   - recommended action
   - confidence
3. Copilot returns answer + citations.
4. No blocking loader/spinner interrupts timeline playback.

## 8. Troubleshooting During Demo

### "Scenario execution failed"

- Refresh page once.
- Confirm server is running on `:8080`.
- Check browser points to `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`.

### Copilot seems generic

- In local mode this can happen when fallback provider is active.
- For richer reasoning, ensure Ollama is running or switch to production mode cloud provider.

### Need strict zero-quota local run

- Keep:
  - `APP_MODE=local-demo`
  - `NEXT_PUBLIC_APP_MODE=local-demo`

## 9. CTO Q&A Short Answers

### "Is this real-time?"

- "It is near-real-time simulation with deterministic timeline streaming for reliable demos; backend reasoning is generated per run."

### "Can this scale?"

- "Yes. Web and API are deployable independently. Provider abstraction supports local and cloud LLM routing."

### "How do we control cost?"

- "Use local-demo mode for development and route production to cost-optimized models with guardrails and caching."
