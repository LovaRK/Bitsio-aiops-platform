# Deployment Guide

## 1. Backend First (Render or Railway)

Deploy server from repo root:

- Build: `npm install && npm run build -w @bitsio/server`
- Start: `npm run start -w @bitsio/server`

Set environment:

- `NODE_ENV=production`
- `LLM_RUNTIME=openrouter`
- `OPENROUTER_API_KEY=<key>`
- `OPENROUTER_MODEL=openai/gpt-4o-mini`
- `CORS_ORIGIN=https://<frontend>.vercel.app`
- Optional:
  - `GEMINI_API_KEY`
  - `FIRESTORE_ENABLED=true` + Firebase Admin credentials

Validate:

- `GET https://<backend>/health`

## 2. Frontend (Vercel)

Project settings:

- Root directory: `apps/web`
- Build command: `npm run build -w @bitsio/web`

Environment:

- `NEXT_PUBLIC_API_BASE_URL=https://<backend>.onrender.com`
- All required `NEXT_PUBLIC_FIREBASE_*` values

Validate:

- Open deployed URL
- Trigger scenario button
- Confirm timeline streams and charts render

## 3. Security Checklist

- No API keys in frontend bundle
- LLM keys only in backend env
- Firebase admin keys only on backend
- CORS restricted to frontend URL
