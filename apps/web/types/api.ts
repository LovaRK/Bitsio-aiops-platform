export type ScenarioId = "aiops-trace" | "maturity-assessment" | "financial-services";

export interface ScenarioSummary {
  id: ScenarioId;
  title: string;
  summary: string;
}

export interface MetricPoint {
  timestamp: string;
  latencyP95: number;
  errorRate: number;
  throughput: number;
}

export interface LogEntry {
  timestamp: string;
  service: string;
  severity: "info" | "warn" | "error";
  message: string;
  traceId: string;
}

export interface TraceRecord {
  traceId: string;
  service: string;
  spanCount: number;
  durationMs: number;
  status: "ok" | "degraded" | "failed";
}

export interface TelemetrySnapshot {
  service: string;
  latencyP95: number;
  errorRate: number;
  traceId: string;
  metricsSeries: MetricPoint[];
  logs: LogEntry[];
  traces: TraceRecord[];
}

export interface TimelineStep {
  id: string;
  stage:
    | "trigger"
    | "context_retrieval"
    | "reasoning"
    | "policy_check"
    | "action_execution"
    | "outcome";
  title: string;
  detail: string;
  timestamp: string;
}

export interface AIReasoning {
  root_cause: string;
  impact: string;
  recommended_action: string;
  confidence: number;
}

export interface ScenarioRunResponse {
  scenario: {
    id: ScenarioId;
    title: string;
    summary: string;
    telemetry: TelemetrySnapshot;
    docs: string[];
  };
  reasoning: AIReasoning;
  timeline: TimelineStep[];
  provider: string;
  policyVerdict: "allow" | "manual-review";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
