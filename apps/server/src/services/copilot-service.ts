import {
  buildCopilotPrompt,
  type LLMGateway
} from "@bitsio/ai";
import type { ScenarioKind } from "@bitsio/domain";
import { getScenarioById } from "@bitsio/telemetry";
import { enforcePromptCharLimit } from "../utils/prompt-guard";
import { TTLCache } from "../utils/ttl-cache";

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

export function createCopilotService(
  gateway: LLMGateway,
  options: {
    timeoutMs: number;
    promptMaxChars: number;
    cacheTtlMs: number;
  }
) {
  const answerCache = new TTLCache<string, CopilotChatOutput>(options.cacheTtlMs);

  return {
    async chat(input: CopilotChatInput): Promise<CopilotChatOutput> {
      const cacheKey = `${input.scenarioId}:${normalizeQuestion(input.question)}`;
      const cached = answerCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const scenario = getScenarioById(input.scenarioId);
      const retrievedContext = retrieveContext(input.question, scenario.docs, scenario.telemetry.logs.map((log) => log.message));
      const prompt = enforcePromptCharLimit(
        buildCopilotPrompt({
          scenario,
          question: input.question,
          retrievedContext,
          history: input.history
        }),
        options.promptMaxChars
      );

      try {
        const { text, provider } = await gateway.generate({
          prompt,
          options: {
            temperature: 0.1,
            maxTokens: 320,
            timeoutMs: options.timeoutMs
          }
        });

        const output: CopilotChatOutput = {
          answer: text,
          citations: retrievedContext,
          provider
        };

        answerCache.set(cacheKey, output);
        return output;
      } catch {
        const fallback: CopilotChatOutput = {
          answer: fallbackAnswer(input.question, scenario.summary),
          citations: retrievedContext,
          provider: "fallback-local"
        };

        answerCache.set(cacheKey, fallback, Math.min(options.cacheTtlMs, 20_000));
        return fallback;
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

function normalizeQuestion(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
