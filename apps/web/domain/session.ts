export type SessionMode = "guest" | "auth" | "none";

export interface SessionState {
  uid: string;
  email?: string;
  mode: SessionMode;
}
