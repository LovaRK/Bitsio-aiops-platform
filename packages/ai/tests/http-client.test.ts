import { afterEach, describe, expect, it, vi } from "vitest";

import { postJsonWithTimeout } from "../src/utils/http-client";

describe("postJsonWithTimeout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed json on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true })
      })
    );

    const result = await postJsonWithTimeout<{ input: string }, { ok: boolean }>({
      url: "https://example.com",
      body: { input: "x" },
      timeoutMs: 1000,
      timeoutReason: "timeout",
      operationName: "TestOp"
    });

    expect(result.ok).toBe(true);
  });

  it("throws operation-specific error on non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502
      })
    );

    await expect(
      postJsonWithTimeout({
        url: "https://example.com",
        body: { input: "x" },
        timeoutMs: 1000,
        timeoutReason: "timeout",
        operationName: "FailOp"
      })
    ).rejects.toThrow("FailOp failed with status 502");
  });
});
