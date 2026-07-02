import type { Lead, TriggerType } from "./types";

// ─── Deterministic fallback scorer ──────────────────────────────────────────
// Works with ZERO API keys. LLM scoring (via /api/llm) refines these numbers;
// this guarantees the routing matrix always functions.

const TRIGGER_INTENT: Record<TriggerType, number> = {
  EVENT: 30,
  OPENING: 25,
  EXPANSION: 20,
  LAUNCH: 18,
  HIRING: 15,
  REBRAND: 10,
  STACK_CHANGE: 8,
  NONE: 0,
};

export function ruleScore(lead: Lead): { fit: number; intent: number; reason: string } {
  let fit = 0;
  const why: string[] = [];

  // Tier weight
  const tierPts = lead.tier === 1 ? 30 : lead.tier === 2 ? 18 : 10;
  fit += tierPts;
  why.push(`T${lead.tier} niche +${tierPts}`);

  // Geography: EU home turf > NA > rest
  const eu = ["NL", "DE", "ES", "UK", "GB", "FR", "IT", "AT", "HU", "SE", "IE", "BE", "PT", "DK"];
  const na = ["US", "CA"];
  const cc = lead.country.toUpperCase();
  if (eu.includes(cc)) {
    fit += 15;
    why.push("EU +15");
  } else if (na.includes(cc)) {
    fit += 8;
    why.push("NA +8");
  }

  // Reachability
  if (lead.email) {
    fit += 20;
    why.push("email +20");
  } else if (lead.instagram) {
    fit += 8;
    why.push("IG only +8");
  }
  if (lead.contactPerson) {
    fit += 15;
    why.push("buyer identified +15");
  }
  if (lead.website) {
    fit += 10;
    why.push("website +10");
  }

  // Intent from trigger
  let intent = 0;
  if (lead.trigger && lead.trigger.type !== "NONE") {
    intent += TRIGGER_INTENT[lead.trigger.type] + 10;
    why.push(`trigger ${lead.trigger.type}`);
    const days = (Date.now() - new Date(lead.trigger.date).getTime()) / 86400000;
    if (days <= 14) {
      intent += 40;
      why.push("≤14d +40");
    } else if (days <= 60) {
      intent += 20;
      why.push("≤60d +20");
    }
  }
  if (lead.history.some((h) => h.kind === "REPLY")) {
    intent += 25;
    why.push("replied +25");
  }

  return {
    fit: Math.min(100, fit),
    intent: Math.min(100, intent),
    reason: why.join(", "),
  };
}

export type Route = "TODAY" | "THIS_WEEK" | "NURTURE" | "ARCHIVE" | "DISCARD";

export function route(fit: number | null, intent: number | null): Route {
  const f = fit ?? 0;
  const i = intent ?? 0;
  if (f >= 70 && i >= 60) return "TODAY";
  if (f >= 70 && i >= 30) return "THIS_WEEK";
  if (f >= 40 && i >= 60) return "THIS_WEEK";
  if (f >= 70 || (f >= 40 && i >= 30)) return "NURTURE";
  if (f >= 40 || i >= 30) return "ARCHIVE";
  return "DISCARD";
}

export function priority(lead: Lead): number {
  // Queue ranking: intent-weighted, tier-boosted
  return (lead.intent ?? 0) * 1.4 + (lead.fit ?? 0) + (lead.tier === 1 ? 15 : 0);
}
