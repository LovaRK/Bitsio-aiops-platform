import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";

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

    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 12_000;
    const timeout = setTimeout(() => controller.abort("openrouter-timeout"), timeoutMs);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.config.referer ? { "HTTP-Referer": this.config.referer } : {}),
          ...(this.config.appName ? { "X-Title": this.config.appName } : {})
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.model,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 300,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter response missing content");
      }

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }
}
