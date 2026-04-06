import {
  buildCopilotPrompt,
  type LLMGateway
} from "@bitsio/ai";
import type { ScenarioKind } from "@bitsio/domain";
import { getScenarioById } from "@bitsio/telemetry";

export interface CopilotChatInput {
  scenarioId: ScenarioKind;
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface CopilotChatOutput {
  answer: string;
  citations: string[];
  provider: string;
}

export function createCopilotService(gateway: LLMGateway, timeoutMs: number) {
  return {
    async chat(input: CopilotChatInput): Promise<CopilotChatOutput> {
      const scenario = getScenarioById(input.scenarioId);
      const retrievedContext = retrieveContext(input.question, scenario.docs, scenario.telemetry.logs.map((log) => log.message));
      const prompt = buildCopilotPrompt({
        scenario,
        question: input.question,
        retrievedContext,
        history: input.history
      });

      try {
        const { text, provider } = await gateway.generate({
          prompt,
          options: {
            temperature: 0.1,
            maxTokens: 320,
            timeoutMs
          }
        });

        return {
          answer: text,
          citations: retrievedContext,
          provider
        };
      } catch {
        return {
          answer: fallbackAnswer(input.question, scenario.summary),
          citations: retrievedContext,
          provider: "fallback-local"
        };
      }
    }
  };
}

function retrieveContext(question: string, docs: string[], logs: string[]): string[] {
  const corpus = [...docs, ...logs];
  const tokens = tokenize(question);

  const scored = corpus.map((chunk) => {
    const chunkTokens = tokenize(chunk);
    const overlap = tokens.filter((token) => chunkTokens.includes(token)).length;
    return { chunk, score: overlap };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.chunk);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function fallbackAnswer(question: string, summary: string): string {
  return `LLM providers are temporarily unavailable. Based on scenario context: ${summary}. Focus first on validating service saturation, then execute controlled remediation. User question: ${question}`;
}
