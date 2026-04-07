const TRUNCATION_SUFFIX = "\n\n[Prompt truncated by server guardrail]";

export function enforcePromptCharLimit(prompt: string, maxChars: number): string {
  if (maxChars <= 0 || prompt.length <= maxChars) {
    return prompt;
  }

  const headChars = maxChars - TRUNCATION_SUFFIX.length;
  if (headChars <= 0) {
    return prompt.slice(0, maxChars);
  }

  return `${prompt.slice(0, headChars)}${TRUNCATION_SUFFIX}`;
}
