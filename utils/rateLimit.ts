// A small in-memory limiter for failed attempts. State lives in the Node
// process, which is enough for a single container; use a shared store if the
// site is ever scaled across several instances.

type Entry = { failures: number; resetAt: number };

export type FailureLimiter = {
  /** Seconds the key must wait before trying again, or 0 when allowed. */
  retryAfter: (key: string) => number;
  recordFailure: (key: string) => void;
  reset: (key: string) => void;
};

export function createFailureLimiter(maxFailures: number, windowMs: number): FailureLimiter {
  const entries = new Map<string, Entry>();

  const prune = (now: number): void => {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
  };

  return {
    retryAfter(key) {
      const now = Date.now();
      prune(now);
      const entry = entries.get(key);
      if (!entry || entry.failures < maxFailures) return 0;
      return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    },
    recordFailure(key) {
      const now = Date.now();
      prune(now);
      const entry = entries.get(key);
      if (entry) {
        entry.failures += 1;
      } else {
        entries.set(key, { failures: 1, resetAt: now + windowMs });
      }
    },
    reset(key) {
      entries.delete(key);
    },
  };
}
