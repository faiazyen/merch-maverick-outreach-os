# Batch 1: Top 1000 Templated Personalized Outreach Emails

## Summary

- **Total emails generated:** 1000
- **Selection method:** All 1000 rows had `email_confidence == "found_on_site"`, a non-empty email, and both `rating` and `review_count` populated. Sorted by rating descending, then review_count descending as tiebreak. No fallback rows (without rating/review_count) were needed to reach 1000.

## Breakdown by niche

| Niche | Count |
|---|---|
| pilates | 399 |
| cold_plunge | 334 |
| sauna | 226 |
| run_club | 41 |

## Breakdown by niche and region

| Niche | US | EU |
|---|---|---|
| sauna | 130 | 96 |
| pilates | 176 | 223 |
| run_club | 7 | 34 |
| cold_plunge | 196 | 138 |

## Dash check

Confirmed via `grep` and a CSV-aware Python parse across every field (name, subject, email_body, etc.) of the full output file: **zero occurrences** of em dash (`—`) or double hyphen (`--`). Two business names in the source data contained em dashes (e.g. "Somaspace — Classical Pilates & the Gyrotonic Method"); these were sanitized to a comma-separated form (e.g. "Somaspace , Classical Pilates & the Gyrotonic Method") consistently across the `name`, `subject`, and `email_body` fields.

## Important note for the founder

These are **first-pass templated personalizations**, not individually researched bespoke copy. Each email is assembled deterministically from the approved template system (rotating subject lines, niche-specific opener/offer/CTA blocks) with real per-lead data substituted in (business name, city, rating, review count). They have **not** been individually reviewed or hand-tuned per lead.

Consistent with how the existing 93/94 EU emails were handled: this batch requires manual review before send. Nothing in this repo sends email automatically — these are drafts only, intended for the founder (or a review pass) to check for tone, accuracy, and edge cases (e.g. unusual business names, non-English city names) before any outreach goes out.

## File

`batch1-top1000.csv` — columns: `name, email, niche, city, country, website, rating, review_count, subject, email_body`

---

# Batch 2: Next 1000 Templated Personalized Outreach Emails

## Summary

- **Total emails generated:** 1000
- **Selection method:** From the same 8 enriched CSVs, excluded every row whose email already appeared in `batch1-top1000.csv` (713 unique emails, case-insensitive match), then deduped again within the batch 2 candidate pool itself (many multi-location businesses share one inbox across niches/files) and dropped one row with a malformed scraped email address. Remaining rows were split by `email_confidence` tier and sorted by rating descending, then review_count descending within each tier. `found_on_site` rows were taken first (741 available, all used), then the remainder was filled from `pattern_guessed_mx_verified` rows (259 used) to reach exactly 1000.
- **Uses the same exact template system** (subject line pool, per-niche product rotation, free-value-offer rotation, opener/offer/CTA blocks) as batch 1, with rotation counters recomputed against batch 2's own row ordering (overall index and per-niche index within batch 2).

## Breakdown by niche

| Niche | Count |
|---|---|
| sauna | 394 |
| pilates | 304 |
| cold_plunge | 241 |
| run_club | 61 |

## Breakdown by niche and region

| Niche | US | EU |
|---|---|---|
| sauna | 142 | 252 |
| pilates | 151 | 153 |
| run_club | 22 | 39 |
| cold_plunge | 102 | 139 |

## Breakdown by email confidence tier

| Tier | Count |
|---|---|
| found_on_site | 741 |
| pattern_guessed_mx_verified | 259 |

Every row carries an `email_confidence` column so guessed-tier emails stay visibly distinguishable from confirmed ones (also labeled per-entry in the Word doc as "Email confidence: found on site" or "Email confidence: pattern guessed").

## Dash check

Confirmed via `grep` across the full `batch2-next1000.csv` and `batch2-leads.json` output files (byte-level search for both the em dash `—` and the double hyphen `--`): **zero occurrences** in either file. A handful of source business names contained em dashes (e.g. "The Bath House — Banya London"); these were sanitized to a comma-separated form consistently across `name`, `subject`, and `email_body`/`paragraphs`.

## Important note for the founder

Same as batch 1: these are **first-pass templated personalizations**, not individually researched bespoke copy, generated deterministically from the approved template system with real per-lead data substituted in. They have **not** been individually reviewed or hand-tuned per lead, and nothing in this repo sends email automatically. Review before any outreach goes out.

## Files

- `batch2-next1000.csv` — columns: `name, email, niche, city, country, website, rating, review_count, email_confidence, subject, email_body`
- `batch2-leads.json` — same grouped-by-niche shape as batch 1's `leads.json`, with a genuine `paragraphs` array (not a flattened string) plus `email_confidence` per entry. Left uncommitted, same as batch 1's `leads.json` (intermediate/build file, regenerate via `generate-batch2.py`).
- `build-docx-batch2.js` — generates `Merch-Maverick-Outreach-Batch2.docx` from `batch2-leads.json`.
- `Merch-Maverick-Outreach-Batch2.docx` — Word document version, grouped by niche with a table of contents, for readability/review.
