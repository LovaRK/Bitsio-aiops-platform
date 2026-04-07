import type { SessionState } from "../../domain/session";
import type { ChatMessage, ScenarioId, ScenarioRunResponse, ScenarioSummary } from "../../types/api";

export interface CopilotResponse {
  answer: string;
  citations: string[];
  provider: string;
}

export interface AIOpsGateway {
  fetchScenarios(): Promise<ScenarioSummary[]>;
  runScenario(id: ScenarioId): Promise<ScenarioRunResponse>;
  chatWithCopilot(scenarioId: ScenarioId, question: string, history: ChatMessage[]): Promise<CopilotResponse>;
  upsertSession(session: SessionState): Promise<void>;
}
