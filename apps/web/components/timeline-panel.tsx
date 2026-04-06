"use client";

import clsx from "clsx";

import type { AIReasoning, TimelineStep } from "../types/api";

interface TimelinePanelProps {
  steps: TimelineStep[];
  streaming: boolean;
  provider?: string;
  policyVerdict?: "allow" | "manual-review";
  reasoning?: AIReasoning;
}

export function TimelinePanel({
  steps,
  streaming,
  provider,
  policyVerdict,
  reasoning
}: TimelinePanelProps) {
  return (
    <aside className="rounded-2xl border border-teal/20 bg-panel p-4 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted">AI Decision Timeline</h3>
        <span className="text-xs text-muted">
          {streaming ? "Streaming decisions..." : provider ? `Provider: ${provider}` : "Awaiting scenario"}
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="animate-fade-up rounded-xl border border-panelSoft bg-bg/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">
                {index + 1}. {step.title}
              </p>
              <span className="text-[11px] text-muted">{new Date(step.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{step.detail}</p>
          </div>
        ))}
      </div>

      {reasoning ? (
        <div className="mt-4 rounded-xl border border-panelSoft bg-bg/50 p-3 text-xs text-text">
          <p><span className="text-muted">Root cause:</span> {reasoning.root_cause}</p>
          <p className="mt-1"><span className="text-muted">Impact:</span> {reasoning.impact}</p>
          <p className="mt-1"><span className="text-muted">Recommended:</span> {reasoning.recommended_action}</p>
          <p className="mt-1 flex items-center gap-2">
            <span className="text-muted">Policy:</span>
            <span
              className={clsx(
                "rounded px-2 py-0.5 font-semibold uppercase tracking-[0.07em]",
                policyVerdict === "allow" ? "bg-teal/20 text-teal" : "bg-warning/20 text-warning"
              )}
            >
              {policyVerdict ?? "n/a"}
            </span>
            <span className="text-muted">Confidence {(reasoning.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>
      ) : null}
    </aside>
  );
}
