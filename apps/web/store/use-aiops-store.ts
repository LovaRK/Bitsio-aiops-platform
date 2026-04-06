"use client";

import { create } from "zustand";

import { chatWithCopilot, fetchScenarios, runScenario, upsertSession } from "../lib/api";
import type { ChatMessage, ScenarioId, ScenarioRunResponse, ScenarioSummary, TimelineStep } from "../types/api";

let playbackToken = 0;

interface SessionState {
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
  session: {
    uid: "",
    mode: "none"
  },
  loadScenarios: async () => {
    const scenarios = await fetchScenarios();
    set({
      scenarios,
      activeScenarioId: scenarios[0]?.id ?? null
    });
  },
  executeScenario: async (id) => {
    set({ statusText: `Running ${id} scenario...` });

    const runData = await runScenario(id);
    set({
      runData,
      activeScenarioId: id,
      chatMessages: [
        {
          role: "assistant",
          content: `Scenario loaded: ${runData.scenario.title}. Ask me what happened, why it happened, or what to do next.`
        }
      ]
    });

    const timeline = runData.timeline;
    playbackToken += 1;
    const token = playbackToken;

    set({
      timelineVisible: [],
      timelineStreaming: true,
      statusText: `Streaming ${timeline.length} decision steps...`
    });

    const pump = (index: number) => {
      if (token !== playbackToken) {
        return;
      }

      if (index >= timeline.length) {
        set({
          timelineStreaming: false,
          statusText: `Decision complete via ${runData.provider}`
        });
        return;
      }

      set((state) => ({
        timelineVisible: [...state.timelineVisible, timeline[index]]
      }));

      const delay = 700 + Math.floor(Math.random() * 301);
      window.setTimeout(() => pump(index + 1), delay);
    };

    pump(0);
  },
  sendMessage: async (question) => {
    const state = get();
    const scenarioId = state.activeScenarioId;

    if (!scenarioId) {
      return;
    }

    const nextMessages = [...state.chatMessages, { role: "user" as const, content: question }];
    set({ chatMessages: nextMessages, chatBusy: true });

    try {
      const response = await chatWithCopilot(scenarioId, question, nextMessages);
      set((current) => ({
        chatMessages: [
          ...current.chatMessages,
          {
            role: "assistant",
            content: `${response.answer}\n\nSources: ${response.citations.join(" | ") || "Scenario telemetry"}`
          }
        ],
        chatBusy: false
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
        chatBusy: false
      }));
    }
  },
  setSession: async (session) => {
    set({ session });

    if (session.mode !== "none") {
      await upsertSession({
        uid: session.uid,
        email: session.email,
        mode: session.mode
      });
    }
  }
}));
