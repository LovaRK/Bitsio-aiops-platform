import type { SessionState } from "../../domain/session";
import type { ChatMessage, ScenarioId, ScenarioRunResponse, ScenarioSummary } from "../../types/api";
import type { AIOpsGateway, CopilotResponse } from "../../application/ports/aiops-gateway";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

class HttpAIOpsGateway implements AIOpsGateway {
  constructor(private readonly apiBase: string) {}

  async fetchScenarios(): Promise<ScenarioSummary[]> {
    const response = await this.request<{ scenarios: ScenarioSummary[] }>("/api/scenarios");
    return response.scenarios;
  }

  runScenario(id: ScenarioId): Promise<ScenarioRunResponse> {
    return this.request<ScenarioRunResponse>(`/api/scenarios/${id}/run`, {
      method: "POST"
    });
  }

  chatWithCopilot(scenarioId: ScenarioId, question: string, history: ChatMessage[]): Promise<CopilotResponse> {
    return this.request<CopilotResponse>("/api/copilot/chat", {
      method: "POST",
      body: JSON.stringify({
        scenarioId,
        question,
        history
      })
    });
  }

  async upsertSession(session: SessionState): Promise<void> {
    await this.request<{ ok: boolean }>("/api/session", {
      method: "POST",
      body: JSON.stringify({
        uid: session.uid,
        email: session.email,
        mode: session.mode
      })
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 15_000);
    const hasBody = typeof init?.body !== "undefined";
    const headers: HeadersInit = {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {})
    };

    try {
      const response = await fetch(`${this.apiBase}${path}`, {
        ...init,
        headers,
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
}

export const aiopsHttpGateway: AIOpsGateway = new HttpAIOpsGateway(API_BASE);
