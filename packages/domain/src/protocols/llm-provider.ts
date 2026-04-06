export interface LLMGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMProvider {
  readonly name: string;
  generate(prompt: string, options?: LLMGenerateOptions): Promise<string>;
}
