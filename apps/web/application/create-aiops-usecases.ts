import type { SessionState } from "../domain/session";
import type { ChatMessage, ScenarioId, ScenarioRunResponse, ScenarioSummary } from "../types/api";
import type { AIOpsGateway, CopilotResponse } from "./ports/aiops-gateway";

export interface AIOpsUseCases {
  loadScenarios(): Promise<ScenarioSummary[]>;
  executeScenario(id: ScenarioId): Promise<ScenarioRunResponse>;
  askCopilot(scenarioId: ScenarioId, question: string, history: ChatMessage[]): Promise<CopilotResponse>;
  syncSession(session: SessionState): Promise<void>;
}

export function createAIOpsUseCases(gateway: AIOpsGateway): AIOpsUseCases {
  return {
    loadScenarios: () => gateway.fetchScenarios(),
    executeScenario: (id) => gateway.runScenario(id),
    askCopilot: (scenarioId, question, history) => gateway.chatWithCopilot(scenarioId, question, history),
    syncSession: (session) => gateway.upsertSession(session)
  };
}
