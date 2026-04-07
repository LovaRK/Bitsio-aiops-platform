"use client";

import { memo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { TelemetrySnapshot } from "../../types/api";

interface MetricsPanelProps {
  telemetry: TelemetrySnapshot | null;
}

export const MetricsPanel = memo(function MetricsPanel({ telemetry }: MetricsPanelProps) {
  const data = telemetry?.metricsSeries.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    errorPct: Number((point.errorRate * 100).toFixed(1))
  })) ?? [];

  return (
    <article className="rounded-2xl border border-panelSoft bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Metrics</h3>
        {telemetry ? (
          <p className="text-xs text-text">p95 {telemetry.latencyP95}ms · err {(telemetry.errorRate * 100).toFixed(1)}%</p>
        ) : null}
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F3761" />
            <XAxis dataKey="time" stroke="#7C8CB1" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="latency" stroke="#12D6C7" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="error" orientation="right" stroke="#FF5F74" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#08162F", border: "1px solid #21416F", borderRadius: 10 }}
              labelStyle={{ color: "#DDE7FF" }}
            />
            <Line
              yAxisId="latency"
              type="monotone"
              dataKey="latencyP95"
              stroke="#12D6C7"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="error"
              type="monotone"
              dataKey="errorPct"
              stroke="#FF5F74"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
});
