import type { TimelineStep } from "../types/api";

interface TimelinePlaybackOptions {
  minDelayMs: number;
  maxDelayMs: number;
  onStep: (step: TimelineStep) => void;
  onComplete: () => void;
}

export function streamTimelineSteps(
  steps: TimelineStep[],
  options: TimelinePlaybackOptions
): () => void {
  let cancelled = false;

  const run = async () => {
    for (const step of steps) {
      if (cancelled) {
        return;
      }

      options.onStep(step);
      await delay(randomDelay(options.minDelayMs, options.maxDelayMs));
    }

    if (!cancelled) {
      options.onComplete();
    }
  };

  void run();

  return () => {
    cancelled = true;
  };
}

function randomDelay(minMs: number, maxMs: number): number {
  const low = Math.max(0, Math.min(minMs, maxMs));
  const high = Math.max(minMs, maxMs);
  return low + Math.floor(Math.random() * (high - low + 1));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
