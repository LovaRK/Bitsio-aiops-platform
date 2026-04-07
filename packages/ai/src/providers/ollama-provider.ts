import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";
import { postJsonWithTimeout } from "../utils/http-client";

export interface OllamaProviderConfig {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";

  constructor(private readonly config: OllamaProviderConfig) {}

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? 12_000;
    const payload = await postJsonWithTimeout<
      {
        model: string;
        prompt: string;
        stream: boolean;
        options: { temperature: number; num_predict: number };
      },
      { response?: string }
    >({
      url: `${this.config.baseUrl}/api/generate`,
      timeoutMs,
      timeoutReason: "ollama-timeout",
      operationName: "Ollama",
      body: {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.2,
          num_predict: options?.maxTokens ?? 300
        }
      }
    });

    if (!payload.response) {
      throw new Error("Ollama response missing `response`");
    }

    return payload.response;
  }
}
