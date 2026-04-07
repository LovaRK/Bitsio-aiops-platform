import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";
import { postJsonWithTimeout } from "../utils/http-client";

export interface OpenRouterProviderConfig {
  apiKey: string;
  model: string;
  referer?: string;
  appName?: string;
}

export class OpenRouterProvider implements LLMProvider {
  readonly name = "openrouter";

  constructor(private readonly config: OpenRouterProviderConfig) {}

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    const timeoutMs = options?.timeoutMs ?? 12_000;
    const payload = await postJsonWithTimeout<
      {
        model: string;
        temperature: number;
        max_tokens: number;
        messages: Array<{ role: "user"; content: string }>;
      },
      { choices?: Array<{ message?: { content?: string } }> }
    >({
      url: "https://openrouter.ai/api/v1/chat/completions",
      timeoutMs,
      timeoutReason: "openrouter-timeout",
      operationName: "OpenRouter",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        ...(this.config.referer ? { "HTTP-Referer": this.config.referer } : {}),
        ...(this.config.appName ? { "X-Title": this.config.appName } : {})
      },
      body: {
        model: this.config.model,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 300,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      }
    });

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter response missing content");
    }

    return content;
  }
}
