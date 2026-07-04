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
