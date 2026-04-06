#!/usr/bin/env node

const baseUrl = process.env.BASE_URL ?? "http://localhost:8080";

const checks = [
  {
    name: "health",
    run: () => getJson(`${baseUrl}/health`)
  },
  {
    name: "scenarios",
    run: () => getJson(`${baseUrl}/api/scenarios`)
  },
  {
    name: "run-scenario",
    run: () => postJson(`${baseUrl}/api/scenarios/aiops-trace/run`, {})
  },
  {
    name: "copilot",
    run: () =>
      postJson(`${baseUrl}/api/copilot/chat`, {
        scenarioId: "aiops-trace",
        question: "What happened?",
        history: []
      })
  }
];

let failures = 0;

for (const check of checks) {
  try {
    const result = await check.run();
    console.log(`[ok] ${check.name}`, summarize(result));
  } catch (error) {
    failures += 1;
    console.error(`[fail] ${check.name}`, error instanceof Error ? error.message : String(error));
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("Smoke checks passed.");

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}`);
  }

  return response.json();
}

function summarize(result) {
  if (!result || typeof result !== "object") {
    return "";
  }

  if ("status" in result) {
    return `status=${result.status}`;
  }

  if ("scenarios" in result && Array.isArray(result.scenarios)) {
    return `scenarios=${result.scenarios.length}`;
  }

  if ("timeline" in result && Array.isArray(result.timeline)) {
    return `timelineSteps=${result.timeline.length}`;
  }

  if ("answer" in result) {
    return "copilot=ok";
  }

  return "ok";
}
