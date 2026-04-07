"use client";

import { FormEvent, useState } from "react";

import type { ChatMessage } from "../../types/api";

interface CopilotPanelProps {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (message: string) => Promise<void>;
}

export function CopilotPanel({ messages, busy, onSend }: CopilotPanelProps) {
  const [value, setValue] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setValue("");
    await onSend(trimmed);
  };

  return (
    <section className="rounded-2xl border border-panelSoft bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted">AI Copilot</h3>
        <p className="text-xs text-muted">Context-aware RAG chat</p>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl bg-bg/45 p-3">
        {messages.map((message, idx) => (
          <div
            key={`${message.role}-${idx}`}
            className={message.role === "assistant" ? "text-sm text-text" : "text-sm text-mint"}
          >
            <span className="mr-2 text-xs uppercase tracking-[0.1em] text-muted">{message.role}</span>
            <span className="whitespace-pre-wrap">{message.content}</span>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask: What happened? Why? What should we do?"
          className="w-full rounded-lg border border-panelSoft bg-bg px-3 py-2 text-sm text-text outline-none focus:border-teal"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-bg transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
