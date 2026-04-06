import type { ScenarioDefinition, ScenarioKind } from "@bitsio/domain";

import aiopsTrace from "./scenarios/aiops-trace.json";
import financialServices from "./scenarios/financial-services.json";
import maturityAssessment from "./scenarios/maturity-assessment.json";
import { applyTelemetryJitter } from "./generators/apply-jitter";

const scenarios: Record<ScenarioKind, ScenarioDefinition> = {
  "aiops-trace": aiopsTrace as ScenarioDefinition,
  "maturity-assessment": maturityAssessment as ScenarioDefinition,
  "financial-services": financialServices as ScenarioDefinition
};

export function listScenarios(): Array<Pick<ScenarioDefinition, "id" | "title" | "summary">> {
  return Object.values(scenarios).map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    summary: scenario.summary
  }));
}

export function getScenarioById(id: ScenarioKind): ScenarioDefinition {
  const scenario = scenarios[id];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${id}`);
  }

  return applyTelemetryJitter(structuredClone(scenario));
}
