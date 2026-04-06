import type { AIReasoning } from "../models/reasoning";
import type { ScenarioDefinition } from "../models/scenario";
import type { TimelineStep } from "../models/timeline";

const STAGE_ORDER = [
  "trigger",
  "context_retrieval",
  "reasoning",
  "policy_check",
  "action_execution",
  "outcome"
] as const;

export interface BuildTimelineInput {
  scenario: ScenarioDefinition;
  reasoning: AIReasoning;
  policyVerdict: "allow" | "manual-review";
}

export function buildDecisionTimeline(input: BuildTimelineInput): TimelineStep[] {
  const now = Date.now();
  const { scenario, reasoning, policyVerdict } = input;

  const detailsByStage: Record<(typeof STAGE_ORDER)[number], string> = {
    trigger: `Alert fired on ${scenario.telemetry.service}: latency p95 ${scenario.telemetry.latencyP95}ms, error rate ${(scenario.telemetry.errorRate * 100).toFixed(1)}%.`,
    context_retrieval: `Collected ${scenario.telemetry.logs.length} logs, ${scenario.telemetry.metricsSeries.length} metric points, and ${scenario.telemetry.traces.length} traces for root-cause analysis.`,
    reasoning: `Model inference: ${reasoning.root_cause} Impact: ${reasoning.impact}`,
    policy_check: policyVerdict === "allow"
      ? "Policy guardrails passed. Action can be executed automatically."
      : "Policy guardrails flagged elevated risk. Human-in-the-loop approval required.",
    action_execution: `Recommended action: ${reasoning.recommended_action}`,
    outcome: `Predicted confidence ${(reasoning.confidence * 100).toFixed(0)}%. Monitoring continues for rollback conditions.`
  };

  return STAGE_ORDER.map((stage, index) => ({
    id: `${scenario.id}-${stage}-${index + 1}`,
    stage,
    title: toTitle(stage),
    detail: detailsByStage[stage],
    timestamp: new Date(now + index * 10_000).toISOString()
  }));
}

function toTitle(stage: (typeof STAGE_ORDER)[number]): string {
  return stage
    .split("_")
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`)
    .join(" ");
}
