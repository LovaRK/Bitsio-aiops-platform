# Master Prompt for the next Agentic AI

You are an expert full-stack developer and DevOps engineer specialized in AIOps platforms. Your task is to finalize the deployment and production hardening for the `bitsio-aiops-platform`.

## 1. Context
- **Monorepo**: Next.js (web), Fastify (server), and domain-driven packages.
- **Backend Status**: Live on Render at `https://bitsio-aiops-server.onrender.com`.
- **Frontend Status**: Linked to Vercel but build is failing. Fixed with a new `vercel.json` and `vercel-build` script.

## 2. Your Immediate Tasks

### T1: Finalize Vercel Build
Run the following to finalize the frontend deployment:
```bash
cd apps/web && vercel --prod
```
Ensure that the `NEXT_PUBLIC_API_BASE_URL` is correctly applied during this build.

### T2: Secure CORS
Once the Vercel URL is known (e.g., `https://bitsio-aiops-web.vercel.app`):
1. Update `render.yaml` with the exact URL.
2. Update the Render service environment variable `CORS_ORIGIN`.

### T3: Firebase Configuration
1. Open the Firebase Console for project `bitsio-aiops`.
2. Enable "Email Link" Auth.
3. Add the Vercel domain to "Authorized Domains".

## 3. Product Hardening
- **Logs & Observability**: Enhance the log visualization in `apps/web/components/observability-panel.tsx` to include color-coded severity levels.
- **Scenario Enrichment**: Add a 4th scenario related to "Database Deadlock" in `packages/telemetry/src/scenarios/`.

## 4. Design Aesthetics
The UI follows a strict "Enterprise Dark Glassmorphism" aesthetic. Maintain consistent shadows, glass backdrops, and vibrant accent colors (Primary: `#00d2ff`, Secondary: `#9d50bb`).

---
Proceed by running the Vercel deployment first.
