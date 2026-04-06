import { buildReasoningPrompt, type LLMGateway } from "@bitsio/ai";
import {
  buildDecisionTimeline,
  type AIReasoning,
  type ScenarioKind
} from "@bitsio/domain";
import { getScenarioById, listScenarios } from "@bitsio/telemetry";

import type { SessionStore } from "./firestore-service";

export interface ScenarioService {
  list: typeof listScenarios;
  runScenario(id: ScenarioKind): Promise<{
    scenario: ReturnType<typeof getScenarioById>;
    timeline: ReturnType<typeof buildDecisionTimeline>;
    reasoning: AIReasoning;
    provider: string;
    policyVerdict: "allow" | "manual-review";
  }>;
}

export function createScenarioService(
  gateway: LLMGateway,
  sessionStore: SessionStore,
  timeoutMs: number
): ScenarioService {
  return {
    list: listScenarios,
    async runScenario(id) {
      const scenario = getScenarioById(id);
      const prompt = buildReasoningPrompt(scenario);

      const { reasoning, provider } = await gateway.generateReasoning({
        prompt,
        options: {
          temperature: 0.2,
          maxTokens: 280,
          timeoutMs
        }
      });

      const policyVerdict = runPolicyCheck(reasoning, scenario.telemetry.errorRate);
      const timeline = buildDecisionTimeline({
        scenario,
        reasoning,
        policyVerdict
      });

      await sessionStore.addAuditLog("scenario.run", {
        scenarioId: id,
        provider,
        policyVerdict,
        confidence: reasoning.confidence
      });

      return {
        scenario,
        timeline,
        reasoning,
        provider,
        policyVerdict
      };
    }
  };
}

function runPolicyCheck(
  reasoning: AIReasoning,
  errorRate: number
): "allow" | "manual-review" {
  if (errorRate > 0.35 || reasoning.confidence < 0.65) {
    return "manual-review";
  }

  return "allow";
}
