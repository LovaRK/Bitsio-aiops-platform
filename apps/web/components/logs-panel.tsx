"use client";

import clsx from "clsx";
import { memo } from "react";

import type { LogEntry } from "../types/api";

interface LogsPanelProps {
  logs: LogEntry[];
}

export const LogsPanel = memo(function LogsPanel({ logs }: LogsPanelProps) {
  return (
    <article className="rounded-2xl border border-panelSoft bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-muted">Logs</h3>
      <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
        {logs.map((log) => (
          <div key={`${log.timestamp}-${log.message}`} className="rounded-lg bg-bg/50 p-2">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span
                className={clsx(
                  "rounded px-2 py-0.5 font-semibold",
                  log.severity === "error" && "bg-danger/20 text-danger",
                  log.severity === "warn" && "bg-warning/20 text-warning",
                  log.severity === "info" && "bg-teal/20 text-teal"
                )}
              >
                {log.severity.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-text">{log.service}: {log.message}</p>
          </div>
        ))}
      </div>
    </article>
  );
});
