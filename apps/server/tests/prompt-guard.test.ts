import { describe, expect, it } from "vitest";

import { enforcePromptCharLimit } from "../src/utils/prompt-guard";

describe("enforcePromptCharLimit", () => {
  it("keeps prompt untouched when under max length", () => {
    const prompt = "short prompt";
    expect(enforcePromptCharLimit(prompt, 100)).toBe(prompt);
  });

  it("truncates and appends guardrail marker when over max length", () => {
    const prompt = "x".repeat(200);
    const trimmed = enforcePromptCharLimit(prompt, 60);

    expect(trimmed.length).toBeLessThanOrEqual(60);
    expect(trimmed).toContain("Prompt truncated");
  });
});
