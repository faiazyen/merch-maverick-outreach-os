import type { Lead, Niche, Settings } from "./types";

// ─── Prompt factory for the LLM-powered modules ─────────────────────────────

export function marketBrainPrompt(nicheLabel: string): string {
  return `You are the Market Brain of an outreach system for Merch Maverick — a factory-direct B2B custom merchandise company (apparel, uniforms, branded goods; EU + NA; air-freight; low MOQs; client portal).

Build a buyer map for the niche: "${nicheLabel}".

Answer with concise markdown:
1. **Economic buyer** — exact role/title who signs off on merch purchases
2. **Current supply** — what they buy today, from whom, typical prices/MOQs
3. **Top 3 operational complaints** about buying merch (be specific)
4. **Purchase triggers** — events/moments that open a buying window
5. **Watering holes** — FB groups, subreddits, IG hashtags, directories to mine leads from
6. **Kill criteria** — signals that a lead in this niche is NOT worth contacting`;
}

export function scoringPrompt(lead: Lead, niche: Niche | undefined): string {
  return `You are the Fit+Intent scorer of an outreach system for Merch Maverick (factory-direct B2B custom merch, EU+NA, air freight, low MOQ).

Score this lead. Respond with ONLY a JSON object: {"fit": 0-100, "intent": 0-100, "trigger": "EVENT|OPENING|HIRING|LAUNCH|EXPANSION|REBRAND|STACK_CHANGE|NONE", "reason": "<one line>"}

FIT = how well they match our ideal customer (niche tier, size, geography EU>NA, merch surface: team/pro-shop/retail wall, reachable buyer).
INTENT = evidence they have a reason to buy NOW (recent trigger, event coming up, just opened, hiring, rebrand). Score them SEPARATELY — a perfect-fit lead with no timing signal gets high fit, low intent.

LEAD:
${JSON.stringify(
    {
      name: lead.name,
      niche: lead.niche,
      tier: lead.tier,
      city: lead.city,
      country: lead.country,
      contact: `${lead.contactPerson} (${lead.contactRole})`,
      email: lead.email ? "yes" : "no",
      website: lead.website,
      instagram: lead.instagram,
      knownTrigger: lead.trigger,
      notes: lead.notes,
    },
    null,
    2,
  )}

NICHE ICP:
${niche?.icp || "n/a"}`;
}

export function ghostwriterPrompt(lead: Lead, niche: Niche | undefined, settings: Settings): string {
  return `You are Faiaz Mazumder, CEO & Founder of Merch Maverick (factory-direct B2B custom merch — apparel, uniforms, branded goods; EU + NA; fastest air freight; low MOQs; free mockup in 48h; free physical sample; on-time-or-it's-free; beat-your-current-price guarantee; founding-client program: 15 spots, stack locked for life).

Write a cold email to this lead. Respond with ONLY JSON: {"subject": "...", "body": "..."}

VOICE RULES (non-negotiable):
${settings.voiceFile}

STRUCTURE (3 short paragraphs max):
1. The trigger, named specifically (what's happening at THEIR business right now)
2. One pain echoed in the market's own words (see phrasebank), then the risk-reversal micro-offer
3. One CTA with two specific time options (e.g. "Thursday 2pm or Friday 10am CET"), or "reply 'sample'" for low-friction

RULES: plain text, no links, no images, subject lowercase and curiosity-driven (max 6 words), under 110 words total, sign "Faiaz" (full signature appended separately).

LEAD:
${JSON.stringify(
    {
      business: lead.name,
      contact: lead.contactPerson || "the owner",
      role: lead.contactRole,
      niche: lead.niche,
      city: lead.city,
      country: lead.country,
      trigger: lead.trigger,
      notes: lead.notes,
    },
    null,
    2,
  )}

BUYER PHRASEBANK (echo ONE, naturally):
${niche?.phrasebank || "n/a"}

NICHE CONTEXT:
${niche?.icp || "n/a"}`;
}

export function radarPrompt(leads: Lead[]): string {
  return `You are the Account Radar of an outreach system. For each business below, identify any signal from the last 60 days that opens a buying window for custom merchandise/uniforms: EVENT (registered/hosting), OPENING (new location ≤90d), HIRING, LAUNCH, EXPANSION, REBRAND, STACK_CHANGE.

Respond with ONLY a JSON array, one object per business, same order:
[{"id": "<id>", "trigger": "EVENT|OPENING|HIRING|LAUNCH|EXPANSION|REBRAND|STACK_CHANGE|NONE", "evidence": "<what+where, one line>", "date": "<ISO date, best estimate>"}]

BUSINESSES:
${JSON.stringify(
    leads.map((l) => ({
      id: l.id,
      name: l.name,
      niche: l.niche,
      city: l.city,
      country: l.country,
      website: l.website,
      instagram: l.instagram,
      notes: l.notes,
    })),
    null,
    2,
  )}`;
}

// Manual mode: prompt Faiaz can paste into Perplexity/any agent UI
export function manualRadarPrompt(leads: Lead[]): string {
  return `For each business below, search for any news, Instagram activity, event registration, or listing change in the LAST 60 DAYS that signals growth, an upcoming event, hiring, or a rebrand.

Return a JSON array (one object per business, keep the "id" field exactly):
[{"id": "...", "trigger": "EVENT|OPENING|HIRING|LAUNCH|EXPANSION|REBRAND|STACK_CHANGE|NONE", "evidence": "one line with source", "date": "YYYY-MM-DD"}]

Businesses:
${leads.map((l) => `- id: ${l.id} | ${l.name} | ${l.niche} | ${l.city}, ${l.country} | ${l.website || l.instagram}`).join("\n")}`;
}
