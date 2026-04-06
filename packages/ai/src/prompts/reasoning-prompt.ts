import type { ScenarioDefinition } from "@bitsio/domain";

export function buildReasoningPrompt(scenario: ScenarioDefinition): string {
  return [
    "You are an AIOps decision engine for bitsIO Inc.",
    "Analyze the telemetry and return strict JSON only.",
    "JSON schema:",
    "{",
    '  "root_cause": "string",',
    '  "impact": "string",',
    '  "recommended_action": "string",',
    '  "confidence": 0.0',
    "}",
    "Rules:",
    "- Confidence must be a number between 0 and 1.",
    "- Keep each field concise and actionable.",
    "- Do not include markdown.",
    "Telemetry:",
    JSON.stringify(scenario.telemetry),
    "Operational context:",
    scenario.docs.join(" | ")
  ].join("\n");
}
