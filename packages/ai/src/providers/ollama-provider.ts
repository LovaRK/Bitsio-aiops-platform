import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";

export interface OllamaProviderConfig {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";

  constructor(private readonly config: OllamaProviderConfig) {}

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 12_000;
    const timeout = setTimeout(() => controller.abort("ollama-timeout"), timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.2,
            num_predict: options?.maxTokens ?? 300
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { response?: string };
      if (!payload.response) {
        throw new Error("Ollama response missing `response`");
      }

      return payload.response;
    } finally {
      clearTimeout(timeout);
    }
  }
}
