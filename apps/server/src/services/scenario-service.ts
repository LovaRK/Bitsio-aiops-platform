import { buildReasoningPrompt, type LLMGateway } from "@bitsio/ai";
import {
  buildDecisionTimeline,
  type AIReasoning,
  type ScenarioKind
} from "@bitsio/domain";
import { getScenarioById, listScenarios } from "@bitsio/telemetry";

import type { SessionStore } from "./firestore-service";
import { enforcePromptCharLimit } from "../utils/prompt-guard";
import { TTLCache } from "../utils/ttl-cache";

export interface ScenarioRunOutput {
  scenario: ReturnType<typeof getScenarioById>;
  timeline: ReturnType<typeof buildDecisionTimeline>;
  reasoning: AIReasoning;
  provider: string;
  policyVerdict: "allow" | "manual-review";
}

export interface ScenarioService {
  list: typeof listScenarios;
  runScenario(id: ScenarioKind): Promise<ScenarioRunOutput>;
}

export function createScenarioService(
  gateway: LLMGateway,
  sessionStore: SessionStore,
  options: {
    timeoutMs: number;
    promptMaxChars: number;
    cacheTtlMs: number;
  }
): ScenarioService {
  const runCache = new TTLCache<ScenarioKind, ScenarioRunOutput>(options.cacheTtlMs);

  return {
    list: listScenarios,
    async runScenario(id) {
      const cached = runCache.get(id);
      if (cached) {
        return cached;
      }

      const scenario = getScenarioById(id);
      const prompt = enforcePromptCharLimit(
        buildReasoningPrompt(scenario),
        options.promptMaxChars
      );

      const { reasoning, provider } = await gateway.generateReasoning({
        prompt,
        options: {
          temperature: 0.2,
          maxTokens: 280,
          timeoutMs: options.timeoutMs
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

      const result: ScenarioRunOutput = {
        scenario,
        timeline,
        reasoning,
        provider,
        policyVerdict
      };

      runCache.set(id, result);
      return result;
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
