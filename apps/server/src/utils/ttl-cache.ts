interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export class TTLCache<K, V> {
  private readonly storage = new Map<K, CacheEntry<V>>();

  constructor(private readonly ttlMs: number) {}

  get(key: K): V | undefined {
    const found = this.storage.get(key);

    if (!found) {
      return undefined;
    }

    if (Date.now() >= found.expiresAt) {
      this.storage.delete(key);
      return undefined;
    }

    return found.value;
  }

  set(key: K, value: V, ttlOverrideMs?: number): void {
    const expiresAt = Date.now() + (ttlOverrideMs ?? this.ttlMs);
    this.storage.set(key, {
      value,
      expiresAt
    });
  }

  clear(): void {
    this.storage.clear();
  }
}
