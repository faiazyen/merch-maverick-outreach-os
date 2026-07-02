"use client";

import { useState } from "react";
import { useStore, upsertNiche } from "@/lib/store";
import { llm } from "@/lib/llm";
import { marketBrainPrompt } from "@/lib/prompts";
import type { Niche } from "@/lib/types";
import { PageHeader, TierBadge, Toast } from "@/components/ui";
import { Sparkles, ClipboardCopy, Save, Plus } from "lucide-react";

// Market Brain: per-niche ICP intelligence + buyer phrasebank.
// Two modes: AI-generate (BYOK) or Manual (paste output from Perplexity/any agent).

export default function BrainPage() {
  const { data } = useStore();
  const [selectedId, setSelectedId] = useState(data.niches[0]?.id || "");
  const [toast, setToast] = useState({ msg: "", error: false });
  const [busy, setBusy] = useState(false);

  const niche = data.niches.find((n) => n.id === selectedId);
  const [draft, setDraft] = useState<Niche | null>(null);
  const current = draft && draft.id === selectedId ? draft : niche || null;

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };

  function select(id: string) {
    setSelectedId(id);
    setDraft(null);
  }

  async function generate() {
    if (!current) return;
    setBusy(true);
    try {
      const text = await llm(data.settings, marketBrainPrompt(current.label), { maxTokens: 1500 });
      setDraft({ ...current, icp: text });
      say("ICP generated — review, edit, then Save.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Generation failed", true);
    } finally {
      setBusy(false);
    }
  }

  async function copyPrompt() {
    if (!current) return;
    await navigator.clipboard.writeText(marketBrainPrompt(current.label));
    say("Prompt copied — paste it into Perplexity, then paste the answer back here.");
  }

  function addNiche() {
    const label = prompt("New niche name (e.g. 'Pickleball Clubs NA'):");
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const n: Niche = { id, label, tier: 2, icp: "", phrasebank: "", sequenceTemplate: "T1-CLUB" };
    upsertNiche(n);
    setSelectedId(id);
    setDraft(null);
  }

  return (
    <div>
      <PageHeader
        title="Market Brain"
        subtitle="ICP intelligence per niche — the buyer map every other module reads."
      >
        <button className="btn btn-ghost" onClick={addNiche}>
          <Plus size={15} /> New niche
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="card p-2" aria-label="Niches">
          {data.niches.map((n) => (
            <button
              key={n.id}
              onClick={() => select(n.id)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                n.id === selectedId
                  ? "bg-[--color-accent-glow] text-[--color-accent]"
                  : "text-[--color-text-dim] hover:bg-[--color-surface-2]"
              }`}
            >
              <span className="truncate font-medium">{n.label}</span>
              <TierBadge tier={n.tier} />
            </button>
          ))}
        </nav>

        {current && (
          <div className="space-y-5">
            <div className="card p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold">{current.label} — ICP / buyer map</h2>
                <div className="flex gap-2">
                  <button className="btn btn-ghost" onClick={copyPrompt}>
                    <ClipboardCopy size={14} /> Copy prompt (manual mode)
                  </button>
                  <button className="btn btn-primary" onClick={generate} disabled={busy}>
                    <Sparkles size={14} /> {busy ? "Thinking…" : "Generate with AI"}
                  </button>
                </div>
              </div>
              <p className="mb-3 text-xs text-[--color-text-faint]">
                Manual mode: copy the prompt → run it in Perplexity/your agent → paste the result below.
              </p>
              <textarea
                className="textarea"
                rows={14}
                value={current.icp}
                onChange={(e) => setDraft({ ...current, icp: e.target.value })}
                placeholder="Buyer map lives here — who signs off, what they pay today, top complaints, purchase triggers, watering holes…"
              />
            </div>

            <div className="card p-6">
              <h3 className="mb-2 font-bold">Buyer phrasebank</h3>
              <p className="mb-3 text-xs text-[--color-text-faint]">
                One phrase per line — verbatim language from Reddit / reviews / IG comments. The
                Ghostwriter must echo one per email. No marketing adjectives.
              </p>
              <textarea
                className="textarea"
                rows={7}
                value={current.phrasebank}
                onChange={(e) => setDraft({ ...current, phrasebank: e.target.value })}
                placeholder={"our kit arrived after race day\nMOQ was 500 so we never bothered"}
              />
              <div className="mt-4 flex justify-end">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (draft) upsertNiche(draft);
                    setDraft(null);
                    say("Niche saved.");
                  }}
                  disabled={!draft}
                >
                  <Save size={14} /> Save niche
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}
