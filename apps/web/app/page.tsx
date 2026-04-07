"use client";

import { useEffect, useMemo } from "react";

import {
  CopilotPanel,
  LogsPanel,
  MetricsPanel,
  QuickAccess,
  TimelinePanel,
  TracePanel
} from "../components";
import { useAuthSession } from "../hooks/use-auth-session";
import { useAIOpsStore } from "../store/use-aiops-store";
import type { ScenarioId } from "../types/api";

export default function HomePage() {
  const {
    scenarios,
    activeScenarioId,
    runData,
    timelineVisible,
    timelineStreaming,
    chatMessages,
    chatBusy,
    statusText,
    session,
    loadScenarios,
    executeScenario,
    sendMessage,
    setSession
  } = useAIOpsStore();

  const { authEnabled, emailInput, setEmailInput, authNote, onGuestMode, onSendMagicLink, onSignOut } =
    useAuthSession(setSession);

  const telemetry = runData?.scenario.telemetry ?? null;

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  useEffect(() => {
    if (!activeScenarioId && scenarios[0]?.id) {
      void executeScenario(scenarios[0].id);
    }
  }, [activeScenarioId, executeScenario, scenarios]);

  const headerIdentity = useMemo(() => {
    if (session.mode === "auth") {
      return session.email ?? "Authenticated user";
    }

    if (session.mode === "guest") {
      return "Guest Demo";
    }

    return "No session";
  }, [session.email, session.mode]);

  const onScenarioSelect = async (id: ScenarioId) => {
    await executeScenario(id);
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-teal/20 bg-panel/80 px-5 py-4 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">bitsIO Inc.</p>
            <h1 className="text-2xl font-semibold text-text">AIOps Decision Intelligence Platform</h1>
            <p className="mt-1 text-sm text-muted">{statusText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-panelSoft bg-bg/50 px-3 py-2 text-xs text-muted">
              {headerIdentity}
            </span>
            <button
              type="button"
              onClick={onGuestMode}
              className="rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs font-semibold text-text"
            >
              Guest Mode
            </button>
            {authEnabled ? (
              <>
                <input
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  type="email"
                  placeholder="Email for magic link"
                  className="w-52 rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs text-text outline-none focus:border-teal"
                />
                <button
                  type="button"
                  onClick={onSendMagicLink}
                  className="rounded-lg border border-teal/60 bg-teal/15 px-3 py-2 text-xs font-semibold text-teal"
                >
                  Magic Link
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs font-semibold text-muted"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <span className="rounded-lg border border-teal/40 bg-teal/10 px-3 py-2 text-xs font-semibold text-teal">
                Local Demo Mode
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-mint">{authNote}</p>
      </header>

      <div className="mt-5">
        <QuickAccess
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelect={(id) => void onScenarioSelect(id)}
        />
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <MetricsPanel telemetry={telemetry} />
          <LogsPanel logs={telemetry?.logs ?? []} />
          <TracePanel traces={telemetry?.traces ?? []} />
        </div>

        <TimelinePanel
          steps={timelineVisible}
          streaming={timelineStreaming}
          provider={runData?.provider}
          policyVerdict={runData?.policyVerdict}
          reasoning={runData?.reasoning}
        />
      </section>

      <section className="mt-5">
        <CopilotPanel messages={chatMessages} busy={chatBusy} onSend={sendMessage} />
      </section>
    </main>
  );
}
