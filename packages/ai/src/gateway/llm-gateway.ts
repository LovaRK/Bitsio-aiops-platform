import type { AIReasoning, LLMGenerateOptions, LLMProvider } from "@bitsio/domain";

import { parseReasoningResponse } from "../utils/safe-json";

export interface GenerateWithFallbackInput {
  prompt: string;
  options?: LLMGenerateOptions;
}

export class LLMGateway {
  constructor(private readonly providers: LLMProvider[]) {
    if (!providers.length) {
      throw new Error("At least one LLM provider is required");
    }
  }

  async generate(input: GenerateWithFallbackInput): Promise<{ text: string; provider: string }> {
    const failures: string[] = [];

    for (const provider of this.providers) {
      try {
        const text = await provider.generate(input.prompt, input.options);
        return { text, provider: provider.name };
      } catch (error) {
        failures.push(`${provider.name}: ${toErrorMessage(error)}`);
      }
    }

    throw new Error(`All LLM providers failed. ${failures.join(" | ")}`);
  }

  async generateReasoning(input: GenerateWithFallbackInput): Promise<{ reasoning: AIReasoning; provider: string }> {
    const result = await this.generate(input);
    const reasoning = parseReasoningResponse(result.text);
    return {
      reasoning,
      provider: result.provider
    };
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
