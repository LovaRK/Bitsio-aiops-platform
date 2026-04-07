import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TTLCache } from "../src/utils/ttl-cache";

describe("TTLCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns value before expiration and evicts after ttl", () => {
    const cache = new TTLCache<string, string>(1_000);

    cache.set("k", "v");
    expect(cache.get("k")).toBe("v");

    vi.advanceTimersByTime(1_001);
    expect(cache.get("k")).toBeUndefined();
  });

  it("supports ttl override per set call", () => {
    const cache = new TTLCache<string, number>(5_000);

    cache.set("n", 42, 100);
    vi.advanceTimersByTime(120);

    expect(cache.get("n")).toBeUndefined();
  });
});
