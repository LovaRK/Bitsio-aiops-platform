export type TimelineStage =
  | "trigger"
  | "context_retrieval"
  | "reasoning"
  | "policy_check"
  | "action_execution"
  | "outcome";

export interface TimelineStep {
  id: string;
  stage: TimelineStage;
  title: string;
  detail: string;
  timestamp: string;
}
