# Leads Import — 2026-07-02 mining run

Source: Apify Google Maps Email Extractor (`lukaskrivka/google-maps-with-contact-details`),
run `U07oZz6U0ZYVqG1Ov`, dataset `345ShHpzr8xbX2Nhv` — 276 raw places, 29 queries across
the Trends-validated breakout cities. US/CA geocoding artifacts removed, junk emails
filtered (godaddy/wix/platform fillers), multi-location chains deduplicated to one row.

## Files

| File | Rows | Use |
|---|---|---|
| `tier1-leads.csv` | 120 | Hyrox gyms · padel clubs · reformer studios · supper clubs (EU) |
| `tier2-leads.csv` | 50 | Bouldering · sauna · golf sim · matcha (EU) |
| `tier3-franchise-targets.csv` | 20 | Franchise HQs + expansion accounts (research-sourced; emails to be enriched via Apollo, 1 credit/match) |
| `transform.mjs` | — | Re-usable transformer for future Apify runs (expects `leads-raw.json`) |

## How to use

**Outreach OS:** Leads → Import CSV → paste file contents → pick default niche/tier → Import.
Then "Rule-score all" (instant), Radar for triggers, Ghostwriter for drafts.

**Manual:** open in Numbers/Sheets — `email` column empty means outreach via Instagram DM
or enrich the owner's email via Apollo (`people_bulk_match`, 1 credit per match).

## Notes

- Chains marked "(N sites)" are one relationship = N locations (mini Tier-3s).
- `contactrole=owner` is a default assumption; verify on first touch.
- Apollo free plan blocks the *search* API — enrichment still works with your 95 credits.
  Priority enrichment targets: tier3 file (franchise development contacts).
