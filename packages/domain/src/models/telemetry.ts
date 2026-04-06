export type LogSeverity = "info" | "warn" | "error";

export interface TelemetryPoint {
  timestamp: string;
  latencyP95: number;
  errorRate: number;
  throughput: number;
}

export interface LogEntry {
  timestamp: string;
  service: string;
  severity: LogSeverity;
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
  metricsSeries: TelemetryPoint[];
  logs: LogEntry[];
  traces: TraceRecord[];
}
