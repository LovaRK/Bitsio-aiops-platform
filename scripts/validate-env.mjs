#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx === args.length - 1) {
    return fallback;
  }

  return args[idx + 1];
}

const target = getArg("--target", "all");
const mode = getArg("--mode", "local");
const source = getArg("--source", mode === "production" ? "process" : "file");

const repoRoot = process.cwd();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

function readFromFiles(candidates) {
  const aggregate = {};
  const found = [];

  for (const relativePath of candidates) {
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    Object.assign(aggregate, parseEnvFile(absolutePath));
    found.push(relativePath);
  }

  return { values: aggregate, foundFiles: found };
}

function isEnabled(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function hasValue(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

function missingKeys(values, keys) {
  return keys.filter((key) => !hasValue(values[key]));
}

function validateServer(values) {
  const issues = [];
  const warnings = [];
  const appMode = String(values.APP_MODE ?? "local-demo").toLowerCase() === "production"
    ? "production"
    : "local-demo";
  const requiredBase = [
    "PORT",
    "CORS_ORIGIN",
    "LLM_TIMEOUT_MS",
    "LLM_MAX_PROMPT_CHARS",
    "SCENARIO_CACHE_TTL_MS",
    "COPILOT_CACHE_TTL_MS"
  ];

  for (const key of missingKeys(values, requiredBase)) {
    issues.push(`[server] Missing required key: ${key}`);
  }

  const runtime = String(values.LLM_RUNTIME ?? "ollama").toLowerCase();
  if (runtime === "ollama") {
    for (const key of missingKeys(values, ["OLLAMA_BASE_URL", "OLLAMA_MODEL"])) {
      issues.push(`[server] Missing Ollama key for runtime=ollama: ${key}`);
    }
  } else if (runtime === "openrouter" && appMode === "production") {
    for (const key of missingKeys(values, ["OPENROUTER_API_KEY", "OPENROUTER_MODEL"])) {
      issues.push(`[server] Missing OpenRouter key for runtime=openrouter: ${key}`);
    }

    if (!hasValue(values.OPENROUTER_REFERER)) {
      warnings.push("[server] OPENROUTER_REFERER is empty (recommended for attribution/debugging)");
    }
  } else if (runtime === "gemini" && appMode === "production") {
    for (const key of missingKeys(values, ["GEMINI_API_KEY", "GEMINI_MODEL"])) {
      issues.push(`[server] Missing Gemini key for runtime=gemini: ${key}`);
    }
  } else if (!["ollama", "openrouter", "gemini"].includes(runtime)) {
    issues.push(`[server] Unsupported LLM_RUNTIME value: ${values.LLM_RUNTIME}`);
  }

  if (appMode === "local-demo" && (runtime === "openrouter" || runtime === "gemini")) {
    warnings.push(
      `[server] APP_MODE=local-demo ignores cloud runtime (${runtime}) and falls back to local providers.`
    );
  }

  if (appMode === "production" && isEnabled(values.FIRESTORE_ENABLED)) {
    for (const key of missingKeys(values, [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY"
    ])) {
      issues.push(`[server] Missing Firebase Admin key when FIRESTORE_ENABLED=true: ${key}`);
    }
  }

  return { issues, warnings };
}

function validateWeb(values) {
  const issues = [];
  const warnings = [];
  const appMode = String(values.NEXT_PUBLIC_APP_MODE ?? "local-demo").toLowerCase() === "production"
    ? "production"
    : "local-demo";

  for (const key of missingKeys(values, ["NEXT_PUBLIC_API_BASE_URL"])) {
    issues.push(`[web] Missing required key: ${key}`);
  }

  const firebaseKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  ];

  if (appMode === "production") {
    const providedCount = firebaseKeys.filter((key) => hasValue(values[key])).length;
    if (providedCount > 0 && providedCount < firebaseKeys.length) {
      for (const key of missingKeys(values, firebaseKeys)) {
        issues.push(`[web] Incomplete Firebase config. Missing: ${key}`);
      }
    } else if (providedCount === 0) {
      warnings.push("[web] Firebase public config not set. App will run in guest/demo auth mode only.");
    }
  } else {
    warnings.push("[web] NEXT_PUBLIC_APP_MODE=local-demo. Auth and Firebase quota usage stay disabled.");
  }

  return { issues, warnings };
}

function printResult(label, result) {
  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.log(`WARN  ${warning}`);
    }
  }

  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      console.error(`ERROR ${issue}`);
    }
  } else {
    console.log(`OK    ${label} env validation passed`);
  }
}

function readValuesForServer() {
  if (source === "process") {
    return { values: process.env, origin: "process.env" };
  }

  const fromFiles = readFromFiles([
    ".env",
    "apps/server/.env",
    ".env.example",
    "apps/server/.env.example"
  ]);
  const usingTemplate = fromFiles.foundFiles.every((file) => file.endsWith(".example"));
  return {
    values: fromFiles.values,
    origin:
      fromFiles.foundFiles.length > 0
        ? `${fromFiles.foundFiles.join(", ")}${usingTemplate ? " (template values)" : ""}`
        : "no local env files found"
  };
}

function readValuesForWeb() {
  if (source === "process") {
    return { values: process.env, origin: "process.env" };
  }

  const fromFiles = readFromFiles([
    ".env",
    "apps/web/.env.local",
    ".env.example",
    "apps/web/.env.local.example"
  ]);
  const usingTemplate = fromFiles.foundFiles.every((file) => file.endsWith(".example"));
  return {
    values: fromFiles.values,
    origin:
      fromFiles.foundFiles.length > 0
        ? `${fromFiles.foundFiles.join(", ")}${usingTemplate ? " (template values)" : ""}`
        : "no local env files found"
  };
}

let hasErrors = false;

if (target === "server" || target === "all") {
  const input = readValuesForServer();
  console.log(`\n[server] Source: ${input.origin}`);
  const result = validateServer(input.values);
  printResult("server", result);
  hasErrors = hasErrors || result.issues.length > 0;
}

if (target === "web" || target === "all") {
  const input = readValuesForWeb();
  console.log(`\n[web] Source: ${input.origin}`);
  const result = validateWeb(input.values);
  printResult("web", result);
  hasErrors = hasErrors || result.issues.length > 0;
}

if (!["all", "server", "web"].includes(target)) {
  console.error(`Unsupported --target value: ${target}`);
  process.exit(1);
}

if (!["local", "production"].includes(mode)) {
  console.error(`Unsupported --mode value: ${mode}`);
  process.exit(1);
}

if (!["file", "process"].includes(source)) {
  console.error(`Unsupported --source value: ${source}`);
  process.exit(1);
}

if (hasErrors) {
  process.exit(1);
}
