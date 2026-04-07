import type { LLMGenerateOptions, LLMProvider } from "@bitsio/domain";
import { postJsonWithTimeout } from "../utils/http-client";

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

    const timeoutMs = options?.timeoutMs ?? 12_000;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    const payload = await postJsonWithTimeout<
      {
        generationConfig: { temperature: number; maxOutputTokens: number };
        contents: Array<{ parts: Array<{ text: string }> }>;
      },
      { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    >({
      url,
      timeoutMs,
      timeoutReason: "gemini-timeout",
      operationName: "Gemini",
      body: {
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxTokens ?? 300
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    });

    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error("Gemini response missing text");
    }

    return content;
  }
}
