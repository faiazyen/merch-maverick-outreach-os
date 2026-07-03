# Founder Handoff — Merch Maverick Outreach Ops
### Read this first in the next session. Last updated 2026-07-03.

---

## Where we are, in one paragraph

We built a full B2B outreach operating system from scratch (private repo, deployed, tested), mined 280 real leads across EU and North America using live Google Trends + Apify, and drafted 93 personalized cold emails into Gmail Drafts using a combined Hormozi-offer + verified-email methodology. **Nothing has been sent yet.** Apollo (95 credits) is untouched — enrichment for ~40 no-email leads is a manual next step, instructions already given. A separate DTC product-brand idea (sauna hats) surfaced from independent research and was deliberately shelved as off-model — see the "What we said no to" section, don't relitigate it without new information.

---

## The system (live, working)

- **App:** [merch-maverick-outreach-os.vercel.app](https://merch-maverick-outreach-os.vercel.app) — Dashboard, Leads, Market Brain, Radar, Ghostwriter, Queue, Settings
- **Repo:** `github.com/faiazyen/merch-maverick-outreach-os` (private) — this file lives at its root
- **Access code:** `maverick-6a8f1036` (also in `.access-code.local`, gitignored)
- **Architecture:** local-first (browser storage), BYOK (Claude/OpenAI/OpenRouter/Exa keys entered in Settings — none committed), Gmail compose deep-links for sending, optional SMTP
- **This is separate from the main Merch Maverick codebase** at `/Users/faiazyen/Desktop/Merch Maverick MAIN LOCAL` — no app code changed there this session.

## The leads (280 total, all in `leads-import/`)

| File | Count | Status |
|---|---|---|
| `tier1-leads.csv` | 118 (94 w/ email) | EU — Hyrox gyms, padel clubs, reformer studios, supper clubs |
| `tier2-leads.csv` | 49 (31 w/ email) | EU — bouldering, sauna, golf sim, matcha |
| `tier3-franchise-targets.csv` | 20 (0 w/ email — research-only) | Franchise HQs (4PADEL, Club Pilates, Slazenger, HYROX HQ...) |
| `north-america-leads.csv` | 90 (50 w/ email) | US/CA — Hyrox is the single biggest signal ever measured (`hyrox 2026` Breakout, 1,049,400 relative value) |
| `north-america-research.md` | — | Full US Trends briefing + strategic deltas vs. EU |

**~40 leads across both regions are missing emails** — mostly the highest-value named accounts (Padel Haus, Sudor Sauna, Reserve Padel, Bouldering Project HQ). Manual Apollo enrichment instructions were given to the user directly in-chat (bulk CSV import + title filter to `owner/founder/GM/franchise development`); not yet executed.

## Gmail Drafts status

**93 EU Tier 1 emails are sitting in Gmail Drafts, unsent.** They are NOT queued for auto-send — human review required per the standing rule (deliverability + personal-send strategy). Written in a combined brain: Hormozi offer structure (trigger → phrasebank pain → risk-reversal → one-word CTA) + the `cold-email-verifier` skill's MX-verification discipline. Every draft is unique — no template language repeated across leads.

**Sending schedule given to the user (not yet executed by them):**
- Day 1: 20 Hyrox + first 10 padel
- Day 2: 20 padel + reformer DE
- Day 3: 20 reformer DACH/Budapest
- Day 4: 20 reformer London + supper clubs
- Day 5: remainder + Day-3 follow-ups for non-repliers

North America leads are mined but **not yet drafted** — that's the natural next action.

## What we said no to (don't relitigate without new evidence)

The user ran an independent Perplexity research playbook (8-gate DTC product discovery) that concluded the single best opportunity is launching a **branded wool-felt sauna hat DTC consumer brand** (score 4.65/5, real Trends data, rigorous methodology — the research itself is good).

**Assessed and shelved as off-model.** Merch Maverick is a factory-direct B2B service (businesses are the customer); a DTC sauna-hat brand is a different company — new supply chain (felt manufacturing), new brand identity, new consumer GTM, new capital ask. Building it now would split focus before the B2B outreach engine has a single proven reply.

**The one real synergy kept:** "sauna hat" was independently discovered by both this DTC research AND our own B2B Trends run (sauna-studio Tier 2, EU). Fold it into the existing sauna-studio outreach pitch as a product-line addition ("we make your studio's branded sauna hats, factory-direct") — not as a standalone company. Full reasoning in Claude's persistent memory (`project_dtc_sauna_hat_research.md`, `feedback_scope_discipline.md`).

## Immediate next actions (pick one)

1. **Send.** Open Gmail Drafts, work top-down, send Day 1's 20 per the schedule above. This is the highest-leverage action — nothing else matters until real replies start coming in.
2. **Enrich.** Run the manual Apollo bulk-CSV import (instructions already delivered) on the ~40 no-email leads, starting with EU since it's the active campaign.
3. **Draft NA.** Once EU sending is underway, draft the 90 North America leads into Gmail using the deadline-led Hyrox angle ("your kit on the start line in Vegas, or it's free") — keep NA sends on separate days from EU to protect daily volume caps.
4. **Track replies.** No CRM wiring yet — replies need to be manually checked in Gmail and reported back so sequences can advance (mark sent/replied in the Outreach OS Leads page, or ask for a Notion tracker to be built).

## Standing rules that apply next session

- **Never send an email without explicit "send" from the user** — drafts only, always.
- **Max 30 cold sends/day**, plain text on touch 1, no links — deliverability guardrail, don't relax it.
- **Reply rate <2% after 100 sends in a niche → stop and rewrite**, don't push volume through a broken message.
- **Any "remove me" → suppress that contact forever, all niches, immediately.**
- **Main Merch Maverick app repo is untouched this session** — if the next session pivots back to app/code work, re-read that repo's own `docs/HANDOFF.md` and `docs/OPEN_TASKS.md` first; they're independent of this file.
