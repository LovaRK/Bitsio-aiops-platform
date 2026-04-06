import type { ScenarioDefinition } from "@bitsio/domain";

export interface CopilotPromptInput {
  scenario: ScenarioDefinition;
  question: string;
  retrievedContext: string[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export function buildCopilotPrompt(input: CopilotPromptInput): string {
  const { scenario, question, retrievedContext, history } = input;

  return [
    "You are bitsIO Copilot, focused on AIOps operations.",
    "Answer using only the given context and telemetry.",
    "If context is missing, clearly say what is missing.",
    "Keep the answer under 120 words and include a short action recommendation.",
    `Scenario: ${scenario.title}`,
    `Summary: ${scenario.summary}`,
    "Telemetry snapshot:",
    JSON.stringify(scenario.telemetry),
    "Retrieved context chunks:",
    retrievedContext.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n"),
    "Recent chat history:",
    history.slice(-4).map((item) => `${item.role}: ${item.content}`).join("\n"),
    `User question: ${question}`
  ].join("\n\n");
}
