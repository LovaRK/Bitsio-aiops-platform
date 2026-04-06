"use client";

import clsx from "clsx";

import type { ScenarioId, ScenarioSummary } from "../types/api";

const SCENARIO_BADGES: Record<ScenarioId, string> = {
  "aiops-trace": "✨ AIOps Trace",
  "maturity-assessment": "📊 Maturity Assessment",
  "financial-services": "🏦 Financial Services"
};

interface QuickAccessProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: ScenarioId | null;
  onSelect: (id: ScenarioId) => void;
}

export function QuickAccess({ scenarios, activeScenarioId, onSelect }: QuickAccessProps) {
  return (
    <section className="rounded-2xl border border-teal/20 bg-panelSoft/70 p-4 shadow-glow backdrop-blur">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Quick Access</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className={clsx(
              "group rounded-xl border px-4 py-3 text-left transition duration-300",
              activeScenarioId === scenario.id
                ? "border-teal bg-teal/10"
                : "border-panel hover:border-teal/50 hover:bg-panel"
            )}
          >
            <p className="text-sm font-semibold text-text">{SCENARIO_BADGES[scenario.id]}</p>
            <p className="mt-1 text-xs text-muted">{scenario.summary}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
