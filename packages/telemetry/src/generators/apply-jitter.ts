import type { ScenarioDefinition } from "@bitsio/domain";

function jitter(value: number, ratio: number): number {
  const offset = (Math.random() * 2 - 1) * ratio;
  return Number((value * (1 + offset)).toFixed(3));
}

export function applyTelemetryJitter(scenario: ScenarioDefinition): ScenarioDefinition {
  return {
    ...scenario,
    telemetry: {
      ...scenario.telemetry,
      latencyP95: Math.round(jitter(scenario.telemetry.latencyP95, 0.08)),
      errorRate: Number(Math.min(0.99, Math.max(0.001, jitter(scenario.telemetry.errorRate, 0.15))).toFixed(3)),
      metricsSeries: scenario.telemetry.metricsSeries.map((point) => ({
        ...point,
        latencyP95: Math.round(jitter(point.latencyP95, 0.1)),
        errorRate: Number(Math.min(0.99, Math.max(0.001, jitter(point.errorRate, 0.15))).toFixed(3)),
        throughput: Math.round(jitter(point.throughput, 0.08))
      }))
    }
  };
}
