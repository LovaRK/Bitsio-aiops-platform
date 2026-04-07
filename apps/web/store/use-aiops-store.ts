"use client";

import { create } from "zustand";

import { isLocalDemoMode } from "../lib/app-mode";
import { chatWithCopilot, fetchScenarios, runScenario, upsertSession } from "../lib/api";
import { streamTimelineSteps } from "../lib/timeline-playback";
import type { ChatMessage, ScenarioId, ScenarioRunResponse, ScenarioSummary, TimelineStep } from "../types/api";

let cancelTimelinePlayback: (() => void) | null = null;

export interface SessionState {
  uid: string;
  email?: string;
  mode: "guest" | "auth" | "none";
}

interface AIOpsState {
  scenarios: ScenarioSummary[];
  activeScenarioId: ScenarioId | null;
  runData: ScenarioRunResponse | null;
  timelineVisible: TimelineStep[];
  timelineStreaming: boolean;
  chatMessages: ChatMessage[];
  chatBusy: boolean;
  statusText: string;
  lastError: string | null;
  session: SessionState;
  loadScenarios: () => Promise<void>;
  executeScenario: (id: ScenarioId) => Promise<void>;
  sendMessage: (question: string) => Promise<void>;
  setSession: (session: SessionState) => Promise<void>;
}

export const useAIOpsStore = create<AIOpsState>((set, get) => ({
  scenarios: [],
  activeScenarioId: null,
  runData: null,
  timelineVisible: [],
  timelineStreaming: false,
  chatMessages: [],
  chatBusy: false,
  statusText: "Ready",
  lastError: null,
  session: {
    uid: "",
    mode: "none"
  },
  loadScenarios: async () => {
    try {
      const scenarios = await fetchScenarios();
      set({
        scenarios,
        activeScenarioId: scenarios[0]?.id ?? null,
        lastError: null
      });
    } catch {
      set({
        lastError: "Unable to load scenarios",
        statusText: "Unable to load scenarios"
      });
    }
  },
  executeScenario: async (id) => {
    set({
      statusText: `Running ${id} scenario...`,
      lastError: null
    });

    try {
      const runData = await runScenario(id);

      set({
        runData,
        activeScenarioId: id,
        chatMessages: [
          {
            role: "assistant",
            content: `Scenario loaded: ${runData.scenario.title}. Ask me what happened, why it happened, or what to do next.`
          }
        ],
        timelineVisible: [],
        timelineStreaming: true,
        statusText: `Streaming ${runData.timeline.length} decision steps...`
      });

      cancelTimelinePlayback?.();
      cancelTimelinePlayback = streamTimelineSteps(runData.timeline, {
        minDelayMs: 700,
        maxDelayMs: 1000,
        onStep: (step) => {
          set((state) => ({
            timelineVisible: [...state.timelineVisible, step]
          }));
        },
        onComplete: () => {
          set({
            timelineStreaming: false,
            statusText: `Decision complete via ${runData.provider}`
          });
        }
      });
    } catch {
      set({
        timelineStreaming: false,
        lastError: "Scenario execution failed",
        statusText: "Scenario execution failed"
      });
    }
  },
  sendMessage: async (question) => {
    const normalized = question.trim();
    if (!normalized) {
      return;
    }

    const state = get();
    const scenarioId = state.activeScenarioId;

    if (!scenarioId) {
      return;
    }

    const nextMessages = [...state.chatMessages, { role: "user" as const, content: normalized }];
    set({ chatMessages: nextMessages, chatBusy: true });

    try {
      const response = await chatWithCopilot(scenarioId, normalized, nextMessages);
      set((current) => ({
        chatMessages: [
          ...current.chatMessages,
          {
            role: "assistant",
            content: `${response.answer}\n\nSources: ${response.citations.join(" | ") || "Scenario telemetry"}`
          }
        ],
        chatBusy: false,
        lastError: null
      }));
    } catch {
      set((current) => ({
        chatMessages: [
          ...current.chatMessages,
          {
            role: "assistant",
            content: "Copilot is temporarily unavailable. Please retry in a few seconds."
          }
        ],
        chatBusy: false,
        lastError: "Copilot request failed"
      }));
    }
  },
  setSession: async (session) => {
    set({ session });

    if (isLocalDemoMode) {
      return;
    }

    if (session.mode !== "none") {
      try {
        await upsertSession({
          uid: session.uid,
          email: session.email,
          mode: session.mode
        });
      } catch {
        set({
          lastError: "Session sync failed"
        });
      }
    }
  }
}));
