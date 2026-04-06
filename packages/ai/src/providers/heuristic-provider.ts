import type { LLMProvider } from "@bitsio/domain";

export class HeuristicProvider implements LLMProvider {
  readonly name = "heuristic-local";

  async generate(prompt: string): Promise<string> {
    if (prompt.includes("JSON schema") && prompt.includes("root_cause")) {
      return JSON.stringify(buildReasoning(prompt));
    }

    return buildCopilotAnswer(prompt);
  }
}

function buildReasoning(prompt: string) {
  const latency = extractNumber(prompt, /"latencyP95":\s*(\d+)/) ?? 900;
  const errorRate = (extractNumber(prompt, /"errorRate":\s*(0\.\d+|1(?:\.0+)?)/) ?? 0.12) as number;
  const service = extractString(prompt, /"service":\s*"([^"]+)"/) ?? "core-service";

  const severe = latency > 1800 || errorRate > 0.3;

  return {
    root_cause: severe
      ? `${service} saturation likely caused by connection pool pressure and retry amplification.`
      : `${service} shows moderate degradation likely tied to transient upstream latency.`,
    impact: severe
      ? "User-facing transactions are delayed, increasing timeout and retry risk."
      : "Intermittent user latency impact with elevated operational noise.",
    recommended_action: severe
      ? "Scale service replicas, increase connection pool limits, and throttle retry policies for 10 minutes."
      : "Tune autoscaling thresholds and monitor p95/error-rate for the next 15 minutes.",
    confidence: severe ? 0.76 : 0.68
  };
}

function buildCopilotAnswer(prompt: string): string {
  const question = extractString(prompt, /User question:\s*([\s\S]*)$/)?.trim();

  if (!question) {
    return "Telemetry indicates instability. Prioritize validating saturation signals and then apply controlled remediation.";
  }

  if (/what happened/i.test(question)) {
    return "Telemetry indicates a latency and error-rate surge in the active service, with trace degradation and log evidence of saturation.";
  }

  if (/why/i.test(question)) {
    return "The likely cause is resource contention combined with retry amplification, which increased queue pressure and request duration.";
  }

  if (/what should we do|next step|action/i.test(question)) {
    return "Apply a guarded mitigation: scale capacity, reduce retry aggressiveness, and keep rollback criteria active while monitoring p95 and errors.";
  }

  return "Use a phased response: verify current blast radius, execute low-risk mitigation, and keep policy guardrails active until metrics stabilize.";
}

function extractNumber(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  if (!match?.[1]) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function extractString(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match?.[1] ?? null;
}
