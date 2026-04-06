import type { AIReasoning } from "@bitsio/domain";

export function parseReasoningResponse(raw: string): AIReasoning {
  const parsed = safeJsonParse(raw);

  const root_cause = toStringField(parsed?.root_cause, "root_cause");
  const impact = toStringField(parsed?.impact, "impact");
  const recommended_action = toStringField(parsed?.recommended_action, "recommended_action");
  const confidence = toConfidence(parsed?.confidence);

  return {
    root_cause,
    impact,
    recommended_action,
    confidence
  };
}

function safeJsonParse(text: string): Record<string, unknown> | null {
  const direct = tryParse(text);
  if (direct) {
    return direct;
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }

  return tryParse(text.slice(start, end + 1));
}

function tryParse(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function toStringField(value: unknown, key: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`LLM response missing ${key}`);
  }

  return value.trim();
}

function toConfidence(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampConfidence(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return clampConfidence(parsed);
    }
  }

  throw new Error("LLM response missing confidence");
}

function clampConfidence(value: number): number {
  return Number(Math.min(1, Math.max(0, value)).toFixed(2));
}
