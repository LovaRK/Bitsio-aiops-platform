# Release Checklist

## Pre-Deploy

- [ ] `npm run test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `BASE_URL=http://localhost:8080 npm run smoke:server`

## Backend Env (Render/Railway)

- [ ] `NODE_ENV=production`
- [ ] `LLM_RUNTIME=openrouter`
- [ ] `OPENROUTER_API_KEY`
- [ ] `OPENROUTER_MODEL`
- [ ] `CORS_ORIGIN=https://<frontend>.vercel.app`
- [ ] Optional Firestore admin keys if persistence required

## Frontend Env (Vercel)

- [ ] `NEXT_PUBLIC_API_BASE_URL=https://<backend>.onrender.com`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Demo Readiness

- [ ] Load public URL and run each quick-access scenario
- [ ] Timeline streams all 6 stages without stalling
- [ ] Copilot answers What happened / Why / What should we do
- [ ] Guest login works
- [ ] Magic-link login works
