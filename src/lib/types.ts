// ─── Outreach OS domain model ───────────────────────────────────────────────

export type Tier = 1 | 2 | 3;

export type Stage =
  | "MINED"
  | "ENRICHED"
  | "SCORED"
  | "QUEUED"
  | "CONTACTED"
  | "ENGAGED"
  | "MEETING"
  | "QUOTE_SENT"
  | "FOUNDING_CLIENT"
  | "NURTURE"
  | "DEAD";

export type TriggerType =
  | "EVENT"
  | "OPENING"
  | "HIRING"
  | "LAUNCH"
  | "EXPANSION"
  | "REBRAND"
  | "STACK_CHANGE"
  | "NONE";

export interface Trigger {
  type: TriggerType;
  evidence: string;
  date: string; // ISO
}

export interface SequenceState {
  template: string; // e.g. "T1-EVENT"
  touch: number; // 0 = not contacted yet
  lastSent: string | null; // ISO
}

export interface HistoryEntry {
  at: string; // ISO
  kind: "SENT" | "REPLY" | "NOTE" | "STAGE" | "SCORE";
  detail: string;
}

export interface Lead {
  id: string;
  niche: string;
  tier: Tier;
  name: string;
  contactPerson: string;
  contactRole: string;
  email: string;
  instagram: string;
  website: string;
  city: string;
  country: string;
  fit: number | null;
  intent: number | null;
  scoreReason: string;
  trigger: Trigger | null;
  stage: Stage;
  sequence: SequenceState;
  draft: { subject: string; body: string } | null;
  history: HistoryEntry[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Niche {
  id: string; // slug
  label: string;
  tier: Tier;
  icp: string; // Market Brain output (markdown/JSON text)
  phrasebank: string; // buyer language, one phrase per line
  sequenceTemplate: string;
}

export type LlmProvider = "anthropic" | "openai" | "openrouter";
export type SearchProvider = "exa" | "manual";

export interface Settings {
  llmProvider: LlmProvider;
  anthropicKey: string;
  anthropicModel: string;
  openaiKey: string;
  openaiModel: string;
  openrouterKey: string;
  openrouterModel: string;
  searchProvider: SearchProvider;
  exaKey: string;
  senderName: string;
  senderEmail: string;
  signature: string;
  voiceFile: string;
  dailyQueueSize: number;
  smtpEnabled: boolean;
  smtpUser: string;
  smtpAppPassword: string;
}

export interface AppData {
  leads: Lead[];
  niches: Niche[];
  settings: Settings;
  version: 1;
}

export const STAGES: Stage[] = [
  "MINED",
  "ENRICHED",
  "SCORED",
  "QUEUED",
  "CONTACTED",
  "ENGAGED",
  "MEETING",
  "QUOTE_SENT",
  "FOUNDING_CLIENT",
  "NURTURE",
  "DEAD",
];

export const TRIGGER_TYPES: TriggerType[] = [
  "EVENT",
  "OPENING",
  "HIRING",
  "LAUNCH",
  "EXPANSION",
  "REBRAND",
  "STACK_CHANGE",
  "NONE",
];
