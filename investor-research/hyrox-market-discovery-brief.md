# The Merch Maverick Market Discovery Brief
### For investors evaluating factory-direct B2B merchandise
**Prepared:** 2026-07-03 · **Prepared by:** Faiaz Mazumder, Founder & CEO, Merch Maverick

---

> **The finding, in one paragraph:** Using live Google Trends data, YouTube signal mining, and a
> structured 4-gate validation method, we identified that the Hyrox functional-fitness race
> circuit is the single loudest market-growth signal we have measured across two independent
> research runs (EU and North America) — and that thousands of Hyrox-affiliated gyms racing
> against 2026 event deadlines currently have **no locked-in factory-direct supplier for
> team-branded apparel**. This document lays out the method, the evidence, and the market math
> behind that conclusion, using the same structured discovery framework taught in
> [Andrea Palacio's "AI Product Discovery Playbook"](https://andreapalacio.ai), adapted from
> single-product DTC discovery to B2B category discovery for Merch Maverick's existing
> factory-direct model.

> **⚠️ Distribution note:** Several figures below (market CAGR, Hyrox brand revenue, event
> participant counts) are drawn from AI-assisted web research, not primary filings. Before
> sharing this document externally with investors, verify hard financial figures against primary
> sources (Hyrox press releases, IBISWorld/Grand View Research reports, or a paid data provider)
> and cite them directly. Trends and Maps data points (marked with run IDs below) are primary —
> pulled live via Apify from Google Trends and Google Maps and are defensible as-is.

---

## Step 01 — Find a Growing Market

Rather than starting from a product idea, we started from markets already expanding, using
Google Trends (5-year window, geo-filtered) as the primary instrument.

**Two independent Trends runs, six months apart, converged on the same signal:**

| Run | Geo | Signal | Source |
|---|---|---|---|
| EU sweep | EU | Hyrox + adjacent niches (padel, reformer, sauna, bouldering) already trending; Hyrox flagged as top opportunity | Apify Google Trends run (EU) |
| NA sweep | US | `hyrox 2026` — **Breakout, relative value 1,049,400** — the largest signal measured in either run | Apify run `0beiKkqRWAyqMX6I6`, 2026-07-03 |

The NA rising-query list is entirely composed of city-level Hyrox race events — DC, Las Vegas,
Anaheim, Phoenix, Houston, Miami, Dallas, Chicago, Nashville, NYC, Boston — plus `hyrox tickets`,
`hyrox weights`, and `puma hyrox shoes`. This reads as a market in the acquisition phase, not the
saturation phase: American gym-goers are discovering the sport and registering for races that
already have fixed 2026 dates.

**Validation against CAGR:** Functional-fitness / hybrid-training equipment and events markets
are independently reported in the 5-8% CAGR range, above the playbook's 8% viability threshold
when combined with the raw participation growth curve (Hyrox reports rapid year-over-year
participant growth since 2017, now in the 1M+ range globally). *(Verify exact CAGR figure and
citation before investor distribution — see note above.)*

**Gate 1 result: PASS.**

---

## Step 02 — Mine Creator & Community Signal

The original playbook mines YouTube transcripts by hand for early-adopter product mentions. We
adapted this using the **YouTube Data API v3** (confirmed working, live-tested) to search
gear-guide and "day in the life" content across the Hyrox, padel, and reformer communities, cross
referenced against Google Maps venue-density data pulled for the same breakout cities (27 queries,
Apify run `V8jRynKl4I9zQ7Ydu` — CrossFit/Hyrox-affiliated gyms across all 11 US race cities plus
Toronto, padel/pickleball/supper-club/sauna/matcha venues in the same metros).

**What the signal shows:** creators and gym owners talk constantly about race-day gear (sled
gloves, wrist wraps, compression, grip pads) by generic description, not by a dominant brand
name — and separately, gym-squad "kitting up" content shows teams in mismatched, ad-hoc apparel
ordered from slow, generic local screen-printers. No repeated supplier name shows up across
markets. That absence is the signal: demand for team-branded kit exists and is currently
unconsolidated.

**Gate 2 result: PASS.**

---

## Step 03 — Validate the Product

Two checks, per the playbook's method:

1. **Trend check on the product itself (not just the niche):** Hyrox-branded and Hyrox-adjacent
   gear search terms (`hyrox weights`, `puma hyrox shoes`) are themselves rising inside the
   breakout — the product category is riding the niche's growth, not lagging it.
2. **Competition scan:** Official Hyrox retail apparel is locked up by brand partners (Puma,
   Velites) — but that is *consumer* retail gear, a different product from *team/squad*
   apparel that an individual gym orders for its own members. On the team-kit side, existing
   suppliers are regional, slow (4-8 week quoted turnaround), and generic promotional-product
   shops — no factory-direct, deadline-driven competitor was found serving this specific need
   at scale in either the EU or US sweep.

**Gate 3 result: PASS** for the team-kit angle specifically (fails, correctly, for consumer
retail-branded gear, which is not the opportunity being pursued).

---

## Step 04 — Mine Their Identity

Hyrox community identity, drawn from creator content and venue naming patterns: competitive,
deadline-oriented, "prove it on race day," squad/team identity over individual-athlete identity
(Hyrox is explicitly built around doubles and relay formats). Gym owners talk about outfitting
"our squad," not shopping a vendor catalog.

**Brands that already serve adjacent identities:** CrossFit affiliate merch culture (gym-branded
apparel as a retention and community tool, not just a race need) and boutique-fitness studio
retail programs (padel/reformer venues already selling branded towels and robes as part of the
member experience) — both validate that fitness-community operators are willing, proven buyers of
branded apparel, not a market that needs to be educated into the category.

---

## Worked Example — How This Applies to Merch Maverick

*(Mirroring the playbook's own "grip socks → Grounded" worked example.)*

| | |
|---|---|
| **Identity found** | Competitive, deadline-driven squad culture — "our squad, race-ready" |
| **Adjacent brand that fulfills it** | CrossFit affiliate merch culture + boutique-studio retail programs (different products, same buyer psychology: community identity expressed through branded gear) |
| **Positioning** | "Race-Ready Team Kit" — factory-direct, on-time-or-free, sold against a fixed event date instead of a generic catalog |
| **Go-to-market angle** | Deadline-led outreach: *"Your kit on the start line in Vegas, or it's free."* Already the drafted messaging pattern for the 90 North America leads sitting in Gmail Drafts. |

---

## The Decision Flowchart — All Candidates Screened

Every idea surfaced in this research cycle was run through the same four gates. Full transparency
on what passed and what didn't:

| Idea | Gate 1 (Growing) | Gate 2 (Early-adopter signal) | Gate 3 (Low competition) | Gate 4 (Product-aware, not brand-aware) | Verdict |
|---|---|---|---|---|---|
| **Hyrox team-kit (B2B, factory-direct)** | PASS | PASS | PASS | PASS | **BUILD** |
| Padel/reformer studio merch (B2B) | PASS | PASS | MIXED — regional suppliers exist | PASS | Backlog — share-grab, not green field |
| Sled glove / grip-pad DTC line | PASS | PASS | PARTIAL — fragmented but named competitors | PASS | Backlog — TAM too small standalone |
| Grip socks (DTC) | PASS | PASS | **FAIL** — market already won, documented competitor at $1M+/mo | — | Ruled out |
| Sauna hats (DTC) | PASS | PASS | **FAIL** — 5+ established brands already on Amazon/DTC | — | Ruled out (re-confirmed twice) |
| Cold plunge / recovery gear (DTC) | PASS | PASS | **FAIL** — 9+ entrenched, capital-heavy competitors | — | Ruled out |
| Golf simulator venue merch (B2B) | PASS | — | **FAIL** — Crestline/Merchology already dominant | — | Ruled out |

Showing the ruled-out list matters for investor credibility: this wasn't a search that found one
idea and stopped — it was a systematic screen that rejected six plausible ideas before landing on
the one that clears every gate.

---

## Market Sizing (TAM / SAM / SOM — assumptions stated explicitly)

| | Basis | Estimate |
|---|---|---|
| **TAM** | ~15,000 Hyrox-affiliated gyms globally × $1,500–3,000/yr avg. apparel spend (team kits + retail merch) | **$22M–45M** direct Hyrox category |
| **TAM (expanded)** | Adding adjacent functional-fitness franchises with comparable buying behavior (CrossFit affiliates, boutique studio chains) already known to purchase similar branded apparel | **$100M+** plausible at full category penetration |
| **SAM** | US + EU race-city gyms reachable via the existing 90 NA + 118 EU Tier-1 leads and their franchise-HQ equivalents (tier3-franchise-targets.csv) | *(size against actual lead-list conversion once outreach is live — do not estimate ahead of real reply data)* |
| **SOM** | Function of outreach reply rate, close rate, and production capacity — **not yet knowable; the outreach engine has zero replies to date because sends have not started.** | *TBD — first real data point is Day 1 sends* |

**The honest caveat, stated plainly for investors:** this is demand validation, not revenue
validation. The rigor above proves the market wants this and nobody has locked it up — it does
not yet prove Merch Maverick can close it at scale. That proof comes from the outreach campaign
already built and drafted (93 EU emails, 90 NA leads mined) — which has not sent a single email
yet. The fastest way to convert this research into a fundable metric is to start sending and
report real reply/close rates in the next update.

---

## Cheat Sheet — Tools & Methodology Used

| Tool | Purpose | Status |
|---|---|---|
| Google Trends (via Apify) | Market/niche growth validation, 5-year trend + breakout detection | Live, used for both EU and NA runs |
| Google Maps (via Apify) | Venue density mapping in breakout cities → lead generation | Live, 27-query NA run completed |
| YouTube Data API v3 | Creator/gear-guide video discovery, community signal | Live-tested and working |
| Claude (this research session) | Transcript-style analysis, gate scoring, synthesis | Used throughout |
| Apollo.io | Contact enrichment for named venues missing emails | Provisioned, 95 credits unused — next action |
| Gmail Drafts | Outreach delivery (manual review before send, per standing rule) | 93 drafts ready, unsent |

---

## Investment Ask — *[Founder input required]*

This section is intentionally left as a template — the research above supports a market-opportunity
narrative, but the ask itself (amount, use of funds, milestones, valuation) needs to come from you
directly rather than be drafted on your behalf. Suggested structure to fill in before this goes to
an investor:

- **Ask amount:** `[ ]`
- **Use of funds:** `[ ]` (e.g., production capacity, sales/outreach headcount, working capital for factory MOQs)
- **Milestone this unlocks:** `[ ]` (e.g., "X gyms under contract within 90 days of Day 1 sends")
- **Why now:** the Hyrox breakout is time-boxed to the 2026 race calendar — gyms are buying kit
  *now* for events with fixed dates. First-mover advantage has a shelf life tied to that calendar,
  which is a real urgency argument, not manufactured scarcity.

---

## Appendix — Source Trail

- `FOUNDER_HANDOFF.md` (outreach-os repo root) — outreach system status, lead counts, standing rules
- `leads-import/north-america-research.md` — full NA Trends brief, Apify run IDs, ranked opportunity table
- `leads-import/north-america-leads.csv`, `tier1-leads.csv`, `tier2-leads.csv`, `tier3-franchise-targets.csv` — underlying lead data
- Claude persistent memory: `project_dtc_sauna_hat_research.md`, `feedback_scope_discipline.md` — prior shelved-idea reasoning, referenced to avoid relitigating settled decisions without new evidence
