# Outreach OS — Merch Maverick

AI-powered outreach operating system: lead pipeline → fit+intent scoring → buyer-language ghostwriting → daily personal send queue.

## Modules

| Module | What it does |
|---|---|
| **Dashboard** | Funnel, KPIs, daily ritual |
| **Leads** | Add / CSV-import / filter accounts; rule-based + AI scoring (fit & intent scored separately); routing matrix (TODAY / THIS WEEK / NURTURE / …) |
| **Market Brain** | Per-niche ICP buyer maps + buyer phrasebanks. Seeded with the 2026-07 Google Trends research (Hyrox, run clubs, padel, reformer studios, supper clubs + Tier 2/3) |
| **Radar** | Finds buying-window triggers (EVENT / OPENING / HIRING / …) via AI batch, Exa live search, or manual Perplexity paste |
| **Ghostwriter** | Drafts trigger-led, phrasebank-echoing emails in Faiaz's voice (≤110 words, plain text) |
| **Queue** | Today's ranked ~30: Gmail compose deep-links (you press send), optional SMTP one-click send, sequence tracking |
| **Settings** | BYOK keys, voice fingerprint, signature, backup/restore |

## AI providers (bring your own key)

- **Claude (Anthropic)** · **OpenAI** · **OpenRouter** — switchable per Settings
- **Exa** for live web research, or **Manual mode**: every AI module has a *Copy prompt* button → run in Perplexity (no API key needed) → paste the JSON result back
- Keys live in `localStorage` only and are relayed per-request through same-origin proxy routes (`/api/llm`, `/api/search`) — never persisted server-side

## Gmail sending

1. **Default:** "Open in Gmail" pre-fills a compose window in your Workspace account — you press send (protects deliverability, zero setup)
2. **Optional:** in-app SMTP send via [Gmail App Password](https://myaccount.google.com/apppasswords)

## Data

Local-first: everything persists in the browser (`localStorage`), with JSON backup/restore in Settings. Upgrade path: swap `src/lib/store.ts` for Supabase/Postgres when multi-device is needed.

## Deploy

```bash
npm install
npm run dev        # local
npm run build      # production build
```

Vercel: import the repo, set env var `ACCESS_CODE=<your passcode>` (protects the deployed app; without it the gate is open for local dev).

## Guardrails baked in

- Max 30 cold/day default, plain-text touch-1, no links
- Reply <2% after 100 sends in a niche → stop and rewrite
- Any "remove me" → suppress forever
