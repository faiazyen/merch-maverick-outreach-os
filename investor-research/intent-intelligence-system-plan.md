# Merch Maverick Intent Intelligence System, Planning Document
### Status: PLAN ONLY, not built. Drafted 2026-07-04.

## What this is

A system that finds businesses showing *buying intent* for custom merchandise, instead of just businesses that exist in a category. Everything built so far (Places API pulls, email enrichment, templated outreach) answers "who is out there." This system answers "who is likely to buy soon," which is a fundamentally better list.

Two target markets, in priority order per founder direction (2026-07-04):

1. **Czech Republic SMEs**, corporate merchandise. Tier 1: foreign-owned / English-speaking offices (US and EU companies with Prague/Brno offices). Tier 2/3: Czech-owned SMEs.
2. **United States bulk apparel importers**, companies already importing custom clothing at volume from China/India/Bangladesh. These are proven buyers with existing spend to capture, not prospects to educate.

## The two data discoveries this plan is built on (both verified 2026-07-04)

### 1. US customs data is public and free, ImportYeti

The founder's instinct ("if I had American customs data I could see which companies buy bulk clothing") is not hypothetical. US sea-freight bills of lading are public records. **ImportYeti** (importyeti.com) obtained the full dataset via FOIA, 70M+ shipment records from 2015 onward, searchable free.

What a record shows: purchaser name, supplier name + country, product HS code, shipment weight, ports. Meaning: you can literally list US companies that imported apparel (HS chapters 61/62) from China/India, how often, and at what volume. **This is the highest-quality B2B intent signal available anywhere in this business, and it costs nothing.**

Limits: sea freight only (no air/road), free tier is search-by-company (bulk CSV export needs a custom plan). Paid alternatives with better query tooling: Panjiva (S&P), ImportGenius.

Play: identify mid-size US importers (big enough to have real volume, small enough that a factory-direct challenger matters to them), pitch parallel/overflow production, faster turnaround, EU-adjacent supply.

### 2. Czech company registry is public and free, ARES

**ARES** (Ministry of Finance, ares.gov.cz) exposes all 2.8M Czech companies via a free, no-login API: IČO, legal form, CZ-NACE industry code, address, status, board members. Filterable by NACE code, municipality, postcode (1,000 results per query cap, so segment queries by NACE × district).

Tier-1 signal (English-speaking foreign offices) is derivable: foreign parent naming patterns ("s.r.o." subsidiaries of foreign brands), board members with non-Czech names, NACE codes typical of foreign shared-service centers / IT hubs, plus cross-reference with CzechInvest's public foreign-investor lists and business-park tenant lists (Prague: The Park Chodov, BB Centrum, Karlín; Brno: Technology Park, Spielberk).

## Intent signals the system would track (ranked by strength)

| Signal | Source | Cost | Strength |
|---|---|---|---|
| Already imports bulk apparel from Asia | ImportYeti / customs records | Free | Strongest, proven spend |
| Hiring office manager / HR / events / marketing coordinator | LinkedIn Jobs, StartupJobs.cz, Jobs.cz | Free to scrape modestly | Strong, merch buyers by role |
| New office opening / expansion announced | Google News, CzechCrunch, local press | Free | Strong, onboarding kits + swag moment |
| Sponsoring events / conferences / sports teams | Event sites, Trends | Free | Medium-strong, already spends on brand visibility |
| Recent funding round | Crunchbase news tier, press | Free-ish | Medium, budget exists, swag follows |
| Headcount growth on LinkedIn | LinkedIn | Manual/paid | Medium |
| Foreign-owned CZ office (Tier 1 fit) | ARES + CzechInvest | Free | Fit signal, not intent, gates the list |

## System architecture (three phases, each independently useful)

### Phase 1, Data layer (scripts, ~a week of sessions, $0)
- ARES pull: all CZ companies filtered by NACE codes for Tier-1-likely industries, Prague + Brno first. Score foreign-ownership likelihood.
- ImportYeti manual research pass: top 100 US apparel importers in the mid-size band, captured into a CSV (manual first, automate only if the motion works).
- Reuse the existing enrichment scraper (already built, 95.8% coverage) for emails.
- Output: `cz-tier1.csv`, `us-importers.csv` in the existing leads-import pattern.

### Phase 2, Intent scoring (the "brain")
- Each lead gets an intent score: fit (industry, size, English-speaking) × signal recency (job posting last 30d, funding last 90d, import shipment last 12mo).
- Claude API call per lead batch to classify job postings / news hits as merch-relevant or not (this is where AI genuinely earns its place, classification, not magic).
- Output: ranked list with a "why now" line per lead, which becomes the personalized opener in outreach (real personalization, not templated, because the signal itself is the personalization).

### Phase 3, Live artifact (the Cowork dashboard)
- Interactive artifact: dashboard showing scored leads by market (CZ / US), filterable by tier, signal type, score. Click a lead → see signals, suggested opener, draft-email button that deep-links to Gmail compose (same pattern Outreach OS already uses).
- Local-first, BYOK, no backend, same architecture philosophy as Outreach OS. Data loads from the CSVs the Phase 1 scripts produce.
- Explicitly NOT a SaaS. Internal tool. (Standing scope decision, see memory: feedback_scope_discipline.)

## What this is NOT (scope guardrails)
- Not a new company or product to sell. Internal leverage only.
- Not a replacement for sending the 2,093 emails already drafted. Those go out first; this system feeds the *next* wave.
- Not dependent on Vertex AI. Data sources are ARES, ImportYeti, job boards, news. Claude handles classification. No GCP service beyond the already-working Places/YouTube keys is needed.

## Honest unknowns
- ImportYeti free tier may be too manual at scale; bulk data may need their custom plan or Panjiva ($$). Validate with 20 manual lookups before spending.
- CZ SME merch budgets are smaller than US importer contracts; Tier-1 CZ is a volume game, US importers are a whale game. Both worth testing, different economics, track separately.
- Czech-language outreach for Tier 2/3 CZ companies: needs native-quality Czech copy, do not send machine-translated Czech to Czech owners.

## Decision needed from founder before any build
1. Confirm phase order (recommend: Phase 1 CZ pull first, it's free and same-day).
2. US importers: manual ImportYeti research pass acceptable to start? (Recommend yes, validate before paying.)
3. When does Day 1 of the existing 93 drafts actually get sent? The intent system's ROI is gated behind a working send motion.
