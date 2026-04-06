import type {
  ChatMessage,
  ScenarioId,
  ScenarioRunResponse,
  ScenarioSummary
} from "../types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), 15_000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchScenarios(): Promise<ScenarioSummary[]> {
  const response = await request<{ scenarios: ScenarioSummary[] }>("/api/scenarios");
  return response.scenarios;
}

export async function runScenario(id: ScenarioId): Promise<ScenarioRunResponse> {
  return request<ScenarioRunResponse>(`/api/scenarios/${id}/run`, {
    method: "POST"
  });
}

export async function chatWithCopilot(
  scenarioId: ScenarioId,
  question: string,
  history: ChatMessage[]
): Promise<{ answer: string; citations: string[]; provider: string }> {
  return request<{ answer: string; citations: string[]; provider: string }>("/api/copilot/chat", {
    method: "POST",
    body: JSON.stringify({
      scenarioId,
      question,
      history
    })
  });
}

export async function upsertSession(payload: {
  uid: string;
  email?: string;
  mode: "guest" | "auth";
}): Promise<void> {
  await request<{ ok: boolean }>("/api/session", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
