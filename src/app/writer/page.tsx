"use client";

import { useMemo, useState } from "react";
import { useStore, upsertLead } from "@/lib/store";
import { llm, extractJson } from "@/lib/llm";
import { ghostwriterPrompt } from "@/lib/prompts";
import { priority } from "@/lib/scoring";
import { PageHeader, ScorePair, TriggerBadge, Empty, Toast } from "@/components/ui";
import { PenLine, Sparkles, ClipboardCopy, Save, Import } from "lucide-react";

// Ghostwriter: drafts the 3-line opener + body in Faiaz's voice.
// AI mode (BYOK) or manual mode (copy prompt → any agent → paste JSON back).

export default function WriterPage() {
  const { data } = useStore();
  const [selectedId, setSelectedId] = useState<string>("");
  const [toast, setToast] = useState({ msg: "", error: false });
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState("");

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };

  // Draftable = scored/enriched, not yet contacted, has email
  const draftable = useMemo(
    () =>
      data.leads
        .filter((l) => ["SCORED", "ENRICHED", "QUEUED", "MINED"].includes(l.stage))
        .sort((a, b) => priority(b) - priority(a)),
    [data.leads],
  );

  const lead = data.leads.find((l) => l.id === selectedId) || draftable[0] || null;
  const niche = lead ? data.niches.find((n) => n.id === lead.niche) : undefined;

  async function generate() {
    if (!lead) return;
    setBusy(true);
    try {
      const text = await llm(data.settings, ghostwriterPrompt(lead, niche, data.settings), {
        maxTokens: 600,
      });
      const parsed = extractJson<{ subject: string; body: string }>(text);
      upsertLead({ ...lead, draft: parsed, stage: lead.stage === "SCORED" ? "QUEUED" : lead.stage });
      say("Draft ready — review below, then it appears in the Queue.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Drafting failed", true);
    } finally {
      setBusy(false);
    }
  }

  async function copyManualPrompt() {
    if (!lead) return;
    await navigator.clipboard.writeText(ghostwriterPrompt(lead, niche, data.settings));
    say("Prompt copied — run it in your agent, paste the JSON back here.");
  }

  function importPaste() {
    if (!lead) return;
    try {
      const parsed = extractJson<{ subject: string; body: string }>(paste);
      upsertLead({ ...lead, draft: parsed, stage: lead.stage === "SCORED" ? "QUEUED" : lead.stage });
      setPaste("");
      say("Draft imported.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not parse pasted JSON", true);
    }
  }

  return (
    <div>
      <PageHeader
        title="Ghostwriter"
        subtitle="Trigger → buyer-phrase echo → risk-reversal → specific CTA. Your voice, under 110 words."
      />

      {draftable.length === 0 ? (
        <Empty title="Nothing to draft" hint="Add and score leads first — high fit+intent accounts show up here ranked." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <nav className="card max-h-[75dvh] overflow-auto p-2" aria-label="Draftable leads">
            {draftable.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                  lead?.id === l.id
                    ? "bg-[--color-accent-glow]"
                    : "hover:bg-[--color-surface-2]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm font-medium ${lead?.id === l.id ? "text-[--color-accent]" : ""}`}>
                    {l.name}
                  </p>
                  {l.draft && <PenLine size={12} className="shrink-0 text-[--color-accent]" />}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <ScorePair fit={l.fit} intent={l.intent} />
                  <TriggerBadge trigger={l.trigger} />
                </div>
              </button>
            ))}
          </nav>

          {lead && (
            <div className="space-y-5">
              <div className="card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{lead.name}</h2>
                    <p className="mono text-xs text-[--color-text-faint]">
                      {lead.contactPerson || "owner"} · {lead.email || "⚠ no email"} · {lead.city}
                    </p>
                    {lead.trigger && (
                      <p className="mono mt-1 text-xs text-[--color-purple]">
                        {lead.trigger.type}: {lead.trigger.evidence}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={copyManualPrompt}>
                      <ClipboardCopy size={14} /> Copy prompt
                    </button>
                    <button className="btn btn-primary" onClick={generate} disabled={busy}>
                      <Sparkles size={14} /> {busy ? "Writing…" : "Draft with AI"}
                    </button>
                  </div>
                </div>

                <label className="label">Subject</label>
                <input
                  className="input mb-4"
                  value={lead.draft?.subject || ""}
                  onChange={(e) =>
                    upsertLead({ ...lead, draft: { subject: e.target.value, body: lead.draft?.body || "" } })
                  }
                  placeholder="lowercase, curiosity-driven, max 6 words"
                />
                <label className="label">Body (plain text, no links)</label>
                <textarea
                  className="textarea"
                  rows={10}
                  value={lead.draft?.body || ""}
                  onChange={(e) =>
                    upsertLead({ ...lead, draft: { subject: lead.draft?.subject || "", body: e.target.value } })
                  }
                  placeholder="Line 1: the trigger, named. Line 2: their pain in their words + the offer. Line 3: two specific times."
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="mono text-xs text-[--color-text-faint]">
                    {(lead.draft?.body || "").split(/\s+/).filter(Boolean).length} words · target ≤110
                  </p>
                  <button
                    className="btn btn-primary"
                    disabled={!lead.draft?.subject || !lead.draft?.body}
                    onClick={() => {
                      upsertLead({ ...lead, stage: "QUEUED" });
                      say("Saved to Queue.");
                    }}
                  >
                    <Save size={14} /> Save to Queue
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <label className="label">Manual mode — paste agent JSON {"{subject, body}"}</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  placeholder='{"subject": "...", "body": "..."}'
                />
                <button className="btn btn-ghost mt-2" onClick={importPaste} disabled={!paste.trim()}>
                  <Import size={14} /> Import draft
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}
