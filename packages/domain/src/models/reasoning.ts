export interface AIReasoning {
  root_cause: string;
  impact: string;
  recommended_action: string;
  confidence: number;
}

export interface CopilotAnswer {
  answer: string;
  citations: string[];
}
