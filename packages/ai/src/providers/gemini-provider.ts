import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";

export interface GeminiProviderConfig {
  apiKey: string;
  model: string;
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";

  constructor(private readonly config: GeminiProviderConfig) {}

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 12_000;
    const timeout = setTimeout(() => controller.abort("gemini-timeout"), timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 300
          },
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error("Gemini response missing text");
      }

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }
}
