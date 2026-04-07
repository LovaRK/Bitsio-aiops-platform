import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadIfExists(path.resolve(process.cwd(), ".env"));
loadIfExists(path.resolve(process.cwd(), "../../.env"));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_MODE: z.enum(["local-demo", "production"]).optional(),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  LLM_RUNTIME: z.enum(["ollama", "openrouter", "gemini"]).optional(),
  LLM_TIMEOUT_MS: z.coerce.number().default(12_000),
  LLM_MAX_PROMPT_CHARS: z.coerce.number().default(12_000),
  SCENARIO_CACHE_TTL_MS: z.coerce.number().default(45_000),
  COPILOT_CACHE_TTL_MS: z.coerce.number().default(60_000),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.1:8b"),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENROUTER_REFERER: z.string().optional(),
  OPENROUTER_APP_NAME: z.string().optional(),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIRESTORE_ENABLED: z.string().optional().default("false")
});

const parsed = envSchema.parse(process.env);
const appMode = parsed.APP_MODE ?? (parsed.NODE_ENV === "production" ? "production" : "local-demo");
const isProductionMode = appMode === "production";
const llmRuntime = isProductionMode
  ? parsed.LLM_RUNTIME ?? "openrouter"
  : "ollama";

export const env = {
  appMode,
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  corsOrigin: parsed.CORS_ORIGIN,
  llmRuntime,
  allowCloudProviders: isProductionMode,
  llmTimeoutMs: parsed.LLM_TIMEOUT_MS,
  llmMaxPromptChars: parsed.LLM_MAX_PROMPT_CHARS,
  scenarioCacheTtlMs: parsed.SCENARIO_CACHE_TTL_MS,
  copilotCacheTtlMs: parsed.COPILOT_CACHE_TTL_MS,
  ollamaBaseUrl: parsed.OLLAMA_BASE_URL,
  ollamaModel: parsed.OLLAMA_MODEL,
  openrouterApiKey: parsed.OPENROUTER_API_KEY,
  openrouterModel: parsed.OPENROUTER_MODEL,
  openrouterReferer: parsed.OPENROUTER_REFERER,
  openrouterAppName: parsed.OPENROUTER_APP_NAME,
  geminiApiKey: parsed.GEMINI_API_KEY,
  geminiModel: parsed.GEMINI_MODEL,
  firestoreEnabled: isProductionMode && parsed.FIRESTORE_ENABLED.toLowerCase() === "true",
  firebaseProjectId: parsed.FIREBASE_PROJECT_ID,
  firebaseClientEmail: parsed.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: parsed.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
} as const;

function loadIfExists(filePath: string): void {
  if (existsSync(filePath)) {
    loadDotenv({ path: filePath, override: false });
  }
}
