import { describe, expect, it } from "vitest";

import type { LLMProvider } from "@bitsio/domain";

import { LLMGateway } from "../src/gateway/llm-gateway";

class MockProvider implements LLMProvider {
  constructor(
    public readonly name: string,
    private readonly behavior: () => Promise<string>
  ) {}

  async generate(): Promise<string> {
    return this.behavior();
  }
}

describe("LLMGateway", () => {
  it("falls back to next provider on failure", async () => {
    const broken = new MockProvider("broken", async () => {
      throw new Error("unavailable");
    });
    const working = new MockProvider("working", async () =>
      JSON.stringify({
        root_cause: "Queue congestion",
        impact: "Delay in settlements",
        recommended_action: "Scale queue worker",
        confidence: 0.83
      })
    );

    const gateway = new LLMGateway([broken, working]);
    const result = await gateway.generateReasoning({ prompt: "diagnose" });

    expect(result.provider).toBe("working");
    expect(result.reasoning.root_cause).toBe("Queue congestion");
  });
});
