import { describe, expect, it } from "vitest";

import type { ScenarioDefinition } from "../src/models/scenario";
import { buildDecisionTimeline } from "../src/usecases/build-timeline";

const scenario: ScenarioDefinition = {
  id: "aiops-trace",
  title: "AIOps Trace",
  summary: "Investigate elevated latency.",
  expectedFlow: [
    "trigger",
    "context_retrieval",
    "reasoning",
    "policy_check",
    "action_execution",
    "outcome"
  ],
  docs: ["Payment service runbook"],
  telemetry: {
    service: "payment-api",
    latencyP95: 2200,
    errorRate: 0.24,
    traceId: "abc123",
    metricsSeries: [{ timestamp: "2026-04-06T00:00:00.000Z", latencyP95: 2200, errorRate: 0.24, throughput: 290 }],
    logs: [{ timestamp: "2026-04-06T00:00:01.000Z", service: "payment-api", severity: "error", message: "Timeout", traceId: "abc123" }],
    traces: [{ traceId: "abc123", service: "payment-api", spanCount: 12, durationMs: 2430, status: "failed" }]
  }
};

describe("buildDecisionTimeline", () => {
  it("creates six ordered timeline steps", () => {
    const timeline = buildDecisionTimeline({
      scenario,
      reasoning: {
        root_cause: "Connection pool saturation",
        impact: "Payment retries increased",
        recommended_action: "Scale pool and reduce upstream timeout",
        confidence: 0.84
      },
      policyVerdict: "allow"
    });

    expect(timeline).toHaveLength(6);
    expect(timeline[0]?.stage).toBe("trigger");
    expect(timeline[5]?.stage).toBe("outcome");
    expect(timeline[2]?.detail).toContain("Connection pool saturation");
  });
});
