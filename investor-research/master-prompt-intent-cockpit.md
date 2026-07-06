# Master Prompt: Merch Maverick Intent Cockpit (Cowork Artifact)
### Paste everything below the line into a Claude Cowork session when steps 1-3 of the
### build spec are done and `intent-leads.json` exists. Do not paste before then; the
### artifact is useless without its data file.

---

You are a senior product engineer building an internal daily-driver tool as a single
self-contained Claude artifact (HTML/JS/CSS, client-side only). Act like a team lead who
has shipped local-first tools before: make pragmatic choices, no frameworks beyond what
an artifact supports natively, no backend, no external API calls.

## Business context (read carefully, this drives every design decision)

Merch Maverick (themerchmaverick.com) is a factory-direct B2B custom merchandise company
run by a solo founder, Faiaz Mazumder, based in Czech Republic, selling custom apparel,
uniforms, and branded goods. Current motion: 20-30 personalized cold emails per day to
high-intent leads, quality over quantity, hard cap 30/day for deliverability. Leads come
from a local pipeline that mines public US customs bill-of-lading data (companies already
importing bulk apparel from Asia = proven buyers) plus hiring/funding/expansion signals.
A weekly Claude Code session refreshes a scored JSON file; this artifact is the daily
cockpit the founder opens every morning to work the queue. Nothing may ever send
automatically; the founder sends every email himself from Gmail.

## Data contract

The artifact loads `intent-leads.json` via a file-open button (artifacts cannot read
disk without user action). Schema per lead:

```json
{
  "id": "string",
  "company": "string",
  "market": "us_importer | cz_tier1",
  "state_or_city": "string",
  "score": 0-9,
  "why_now": "one-line intent summary, pre-written",
  "signals": [{"type": "import|hiring|funding|expansion|event", "date": "YYYY-MM-DD", "detail": "string"}],
  "contact": {"name": "string|null", "role": "string|null", "email": "string", "confidence": "found_on_site|pattern_guessed_mx_verified|apollo"},
  "draft": {"subject": "string", "body": "string with \n\n paragraph breaks"},
  "status": "queued|contacted|replied|dead",
  "last_touched": "YYYY-MM-DD|null"
}
```

Top-level: `{"generated": "YYYY-MM-DD", "leads": [...]}`. Handle a missing or malformed
file with a friendly empty state that explains what file to load and where it comes from.

## Features, v1 exactly, nothing more

1. **Today's Queue**: top 25 leads where status=queued, ranked by score desc. Card shows
   company, market badge, score, why_now line, signal chips with dates, contact email
   with confidence badge (visually distinguish pattern_guessed, it may bounce).
2. **Draft view** per card: subject + body, a Copy button for each, and a Gmail compose
   link (`https://mail.google.com/mail/?view=cm&to=...&su=...&body=...`, URL-encoded).
   Copy buttons are primary (mailto/compose links mangle formatting in some clients).
3. **Status actions** per card: Contacted / Replied / Dead. Persist ALL status changes
   and last_touched dates to localStorage keyed by lead id, merged over the JSON on
   every load (localStorage wins). Include an Export Status button that downloads the
   status map as JSON so the weekly pipeline can sync it back.
4. **Send counter**: sends-today count (increments on Contacted), with a visible warning
   state at 25 and a hard red state at 30 reading "Daily cap reached, deliverability
   rule." Resets by calendar date.
5. **Stats bar**: total leads, contacted, replied, running reply rate %, day streak.
6. **Filters**: market, signal type, score band, status. Search by company name.

## Hard rules, violating any of these is a failed build

- NO em dashes and NO double hyphens anywhere: UI copy, code comments visible in UI,
  and especially anywhere near draft text. The founder has an absolute rule. If a draft
  in the JSON somehow contains one, render a visible warning badge on that card.
- NO auto-send, no simulated sending, no background network calls of any kind.
- All data stays client-side: file load + localStorage only.
- Dark, calm, professional UI. This is a tool used every morning; optimize for scanning
  speed, not decoration. Keyboard: j/k to move between cards, c to copy body.
- Empty states and malformed-data states must be handled gracefully.

## Acceptance test (walk through it before declaring done)

1. Load a sample JSON with 40 leads across both markets and all statuses: queue shows 25
   highest-score queued leads.
2. Mark 3 contacted, reload the file: statuses survive (localStorage merge).
3. Counter shows 3; simulate 30: red cap state appears.
4. Export status: valid JSON downloads.
5. Search "hoodie" style partial company names: filter works.
6. Grep your own artifact source for `--` and the em dash character: zero hits in
   user-visible strings and drafts.

Build it as one artifact, then walk the acceptance test and report each item pass/fail.
