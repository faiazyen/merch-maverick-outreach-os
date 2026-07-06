# Intent Database + Daily Cockpit, Build Specification
### Status: SPEC, approved direction, not yet built. Drafted 2026-07-07.
### Supersedes the phasing in intent-intelligence-system-plan.md where they differ.

## Strategy decision this spec implements (founder, 2026-07-07)

- **Mass sending paused.** The 2,093 drafted emails become a reservoir, not a campaign.
- **New motion: 20-30 personalized, intent-led emails per day.** Quality over quantity.
  This matches the standing deliverability rule (max 30/day) that has existed since the
  first EU campaign.
- **US customs-derived importer database is the core asset.** CZ SME track (ARES) stays
  in the plan but builds second.

## The daily loop this system exists to power

1. Open the Cowork artifact (the cockpit).
2. See "Today's queue": 25 leads ranked by intent score, each with a one-line "why now."
3. Review each, open its drafted email, edit, send manually from Gmail.
4. Mark contacted / replied / dead in the cockpit (localStorage).
5. Pipeline scripts refresh data weekly (new shipments, new signals) in a Claude Code session.

## Component 1: The customs database

### Data reality (verified 2026-07-04)
- US sea-freight bills of lading are public. ImportYeti (importyeti.com) hosts 70M+
  records free: purchaser, supplier + country, HS code, weight, ports, dates.
- Free tier: search and browse company/category pages. Bulk CSV export: paid custom plan.
- Paid bulk alternatives: ImportGenius (~$150-200/mo entry), Panjiva (S&P, enterprise).
- Aggregated free government data (USA Trade Online) has NO company names. Not useful here.

### Phase A: free targeted harvest (build this first, $0)
Target HS codes (Merch Maverick's actual product lanes):
| HS | Product |
|---|---|
| 6109 | T-shirts, tanks |
| 6110 | Sweatshirts, hoodies, pullovers |
| 6505 | Hats, caps, beanies |
| 6302 | Towels, linens |
| 4202 | Bags, totes |
| 6203/6204 | Trousers, uniforms (secondary) |

Method: ImportYeti search/category pages per HS code, harvest US purchasers with
shipments in 2024-2026. Prioritize the mid-band: enough volume to matter (multiple
shipments/year), small enough that a factory-direct challenger gets a meeting (skip
Walmart/Target-scale, skip one-shipment hobbyists). Browsing assist via Claude-in-Chrome
where useful; respect the site, no aggressive scraping.

Capture per company: name, state, supplier countries, HS codes seen, shipment count
2024/2025/2026, last shipment date, est. total weight band.

**Target: 300-500 companies. Stop there. This is a validation dataset, not the ocean.**

### Storage: SQLite, one file, in this repo
`leads-import/intent-db/merch-intent.db`
- `importers` (company, state, first_seen, last_shipment, shipment_count_24/25/26, weight_band, supplier_countries, hs_codes)
- `signals` (company_id, type: import|hiring|funding|expansion|event, date, detail, source_url)
- `contacts` (company_id, name, role, email, confidence, source) — filled by existing scraper + Apollo (95 credits reserved for whale accounts only)
- `outreach` (company_id, status: queued|contacted|replied|dead, date, notes)

SQLite over CSV because scoring queries join across tables; export layer keeps CSVs for
compatibility with the existing leads-import pattern.

### Phase B gate (do not skip): pay only after proof
After the first ~100 intent-led sends: if reply rate ≥2-5% (the zero-to-one framework's
healthy band), buy ImportGenius/Panjiva for bulk 2024-2026 export and ingest the full
apparel dataset. If reply rate <2%, the problem is the pitch or the segment, and more
data would not have fixed it. Money follows proof.

## Component 2: Intent scoring (the "AI intelligence team")

Runs in Claude Code sessions (weekly refresh), not in the artifact.

Score = Fit × Recency × Volume:
- **Fit** (0-3): HS overlap with our lanes; supplier country China/India/Bangladesh
  (= switchable supplier relationship); company size band.
- **Recency** (0-3): shipment in last 90d = 3; hiring for office/HR/marketing/events
  role now = +2; funding/expansion news last 90d = +2.
- **Volume** (0-3): shipments/year band.

Claude's real job (not magic, classification):
- Classify job postings / news hits as merch-intent-relevant or noise.
- Write the one-line "why now" per lead from its signals. This line IS the
  personalization in the email, e.g. "Saw you brought in three hoodie shipments from
  Guangzhou this spring and just opened the Austin office."
- Draft the email per lead using the approved copy blocks + the signal line.
  ABSOLUTE RULE: no em dashes, no double hyphens, ever (memory: feedback-no-em-dash).

Output: `leads-import/intent-db/intent-leads.json` (scored, ranked, with drafts).

## Component 3: The Cowork artifact (daily cockpit)

Client-side only, no backend. Same philosophy as Outreach OS: local-first, nothing sends
automatically, Gmail compose deep-links.

Features (v1, keep small):
1. Load `intent-leads.json` (file-open button; artifacts cannot read disk unprompted).
2. "Today's queue": top 25 uncontacted by score. Card per lead: company, score, why-now
   line, signals list, draft email.
3. Click-to-copy draft / Gmail compose deep-link (mailto with subject+body).
4. Status buttons: contacted / replied / dead → localStorage, exportable as JSON so the
   pipeline can sync it back to SQLite next refresh.
5. Filters: market (US importers / CZ Tier 1 later), signal type, score band.
6. Counters that matter: sends today (cap warning at 30), reply rate running, streak.

Explicitly out of v1: auto-send, inbox integration, CRM sync, multi-user, anything SaaS.

## Build order

| # | Step | Session type | Cost |
|---|---|---|---|
| 1 | SQLite schema + ImportYeti harvest of first 100 companies (manual+assisted) | Claude Code | $0 |
| 2 | Email/contact enrichment on those 100 (existing scraper + Apollo for whales) | Claude Code | $0 |
| 3 | Scoring script + first `intent-leads.json` + drafts | Claude Code | ~$0 |
| 4 | Cowork artifact v1 (master prompt: see master-prompt-intent-cockpit.md) | Cowork | $0 |
| 5 | RUN THE LOOP 2 WEEKS: 20-30/day, track replies | Founder daily | $0 |
| 6 | Gate: ≥2% replies → buy bulk data, scale DB; <2% → fix pitch, not data | Decision | $0 or ~$150/mo |
| 7 | CZ Tier 1 track via ARES (parallel, after US loop is running) | Claude Code | $0 |

## Honest unknowns
- ImportYeti free-tier friction at 300-500 companies is untested; if it's too slow,
  the fallback is starting Phase B earlier with ImportGenius's cheapest tier.
- mailto deep-links strip formatting on some clients; copy-button is the reliable path.
- Reply tracking is manual until proven worth automating.
