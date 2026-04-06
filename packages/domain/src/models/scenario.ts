import type { TelemetrySnapshot } from "./telemetry";

export type ScenarioKind = "aiops-trace" | "maturity-assessment" | "financial-services";

export interface ScenarioDefinition {
  id: ScenarioKind;
  title: string;
  summary: string;
  expectedFlow: string[];
  docs: string[];
  telemetry: TelemetrySnapshot;
}
