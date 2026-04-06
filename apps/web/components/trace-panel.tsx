"use client";

import clsx from "clsx";

import type { TraceRecord } from "../types/api";

interface TracePanelProps {
  traces: TraceRecord[];
}

export function TracePanel({ traces }: TracePanelProps) {
  return (
    <article className="rounded-2xl border border-panelSoft bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-muted">Trace IDs</h3>
      <div className="space-y-2">
        {traces.map((trace) => (
          <div key={trace.traceId} className="rounded-lg bg-bg/50 p-3 text-xs text-text">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-mint">{trace.traceId}</p>
              <span
                className={clsx(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  trace.status === "ok" && "bg-teal/20 text-teal",
                  trace.status === "degraded" && "bg-warning/20 text-warning",
                  trace.status === "failed" && "bg-danger/20 text-danger"
                )}
              >
                {trace.status}
              </span>
            </div>
            <p className="mt-1 text-muted">
              {trace.service} · {trace.spanCount} spans · {trace.durationMs}ms
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
