"use client";

import { useMemo, useState } from "react";
import { useStore, upsertLead } from "@/lib/store";
import { llm, extractJson } from "@/lib/llm";
import { radarPrompt, manualRadarPrompt } from "@/lib/prompts";
import type { TriggerType } from "@/lib/types";
import { PageHeader, TriggerBadge, Empty, Toast } from "@/components/ui";
import { Radar, ClipboardCopy, Import, Globe } from "lucide-react";

// Account Radar: finds "a reason to move" per lead.
// Three modes: AI batch (LLM reasons over known data), Exa live web search,
// and Manual (copy prompt → run in Perplexity → paste JSON back).

interface RadarResult {
  id: string;
  trigger: TriggerType;
  evidence: string;
  date: string;
}

export default function RadarPage() {
  const { data } = useStore();
  const [toast, setToast] = useState({ msg: "", error: false });
  const [busy, setBusy] = useState<string | null>(null);
  const [paste, setPaste] = useState("");

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 4000);
  };

  // Radar works the un-triggered, non-dead top of funnel
  const candidates = useMemo(
    () =>
      data.leads
        .filter((l) => !["DEAD", "FOUNDING_CLIENT"].includes(l.stage))
        .filter((l) => !l.trigger || l.trigger.type === "NONE")
        .slice(0, 20),
    [data.leads],
  );

  function applyResults(results: RadarResult[]): number {
    let n = 0;
    for (const r of results) {
      const lead = data.leads.find((l) => l.id === r.id);
      if (!lead || !r.trigger || r.trigger === "NONE") continue;
      upsertLead({
        ...lead,
        trigger: { type: r.trigger, evidence: r.evidence, date: r.date || new Date().toISOString() },
        stage: lead.stage === "MINED" ? "ENRICHED" : lead.stage,
      });
      n++;
    }
    return n;
  }

  async function runAiBatch() {
    if (candidates.length === 0) return;
    setBusy("ai");
    try {
      const text = await llm(data.settings, radarPrompt(candidates), { maxTokens: 2000 });
      const results = extractJson<RadarResult[]>(text);
      const n = applyResults(results);
      say(`Radar pass complete — ${n} trigger(s) found across ${candidates.length} accounts.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Radar failed", true);
    } finally {
      setBusy(null);
    }
  }

  async function runExa(leadId: string) {
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) return;
    if (!data.settings.exaKey) {
      say("No Exa API key — add it in Settings, or use manual mode.", true);
      return;
    }
    setBusy(leadId);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: data.settings.exaKey,
          query: `${lead.name} ${lead.city} news opening event 2026`,
          numResults: 5,
        }),
      });
      const search = await r.json();
      if (!r.ok) throw new Error(search.error);
      const snippets = (search.results as { title: string; url: string; date: string; snippet: string }[])
        .map((x) => `- ${x.title} (${x.date}) ${x.url}\n  ${x.snippet}`)
        .join("\n");
      const text = await llm(
        data.settings,
        `${radarPrompt([lead])}\n\nLIVE WEB SEARCH RESULTS:\n${snippets || "(none found)"}`,
        { maxTokens: 500 },
      );
      const results = extractJson<RadarResult[]>(text);
      const n = applyResults(results);
      say(n > 0 ? `Trigger found for ${lead.name}.` : `No trigger found for ${lead.name}.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Exa radar failed", true);
    } finally {
      setBusy(null);
    }
  }

  async function copyManualPrompt() {
    await navigator.clipboard.writeText(manualRadarPrompt(candidates));
    say("Prompt copied — run it in Perplexity, paste the JSON array below.");
  }

  function importPaste() {
    try {
      const results = extractJson<RadarResult[]>(paste);
      const n = applyResults(results);
      setPaste("");
      say(`Imported — ${n} trigger(s) applied.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not parse pasted JSON", true);
    }
  }

  const triggered = data.leads.filter((l) => l.trigger && l.trigger.type !== "NONE");

  return (
    <div>
      <PageHeader
        title="Account Radar"
        subtitle="Keep only accounts with a reason to move — event, opening, hiring, launch, rebrand."
      >
        <button className="btn btn-ghost" onClick={copyManualPrompt} disabled={candidates.length === 0}>
          <ClipboardCopy size={15} /> Copy manual prompt
        </button>
        <button className="btn btn-primary" onClick={runAiBatch} disabled={busy !== null || candidates.length === 0}>
          <Radar size={15} /> {busy === "ai" ? "Scanning…" : `AI scan (${candidates.length})`}
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6" aria-label="Untriggered accounts">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
            Watching ({candidates.length} untriggered)
          </h2>
          {candidates.length === 0 ? (
            <p className="py-6 text-center text-sm text-[--color-text-faint]">
              Every active lead has a trigger, or there are no leads yet.
            </p>
          ) : (
            <ul className="divide-y divide-[--color-border]">
              {candidates.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="mono text-xs text-[--color-text-faint]">
                      {l.niche} · {l.city || "—"}
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost !px-2.5 !py-1.5"
                    onClick={() => runExa(l.id)}
                    disabled={busy !== null}
                    title="Live web scan (Exa)"
                    aria-label={`Web scan ${l.name}`}
                  >
                    <Globe size={14} /> {busy === l.id ? "…" : "Scan"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t border-[--color-border] pt-4">
            <label className="label">Manual mode — paste agent JSON result</label>
            <textarea
              className="textarea"
              rows={4}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder='[{"id":"...","trigger":"EVENT","evidence":"...","date":"2026-06-20"}]'
            />
            <button className="btn btn-ghost mt-2" onClick={importPaste} disabled={!paste.trim()}>
              <Import size={14} /> Apply pasted results
            </button>
          </div>
        </section>

        <section className="card p-6" aria-label="Triggered accounts">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
            Buying windows open ({triggered.length})
          </h2>
          {triggered.length === 0 ? (
            <Empty title="No triggers yet" hint="Run a scan or paste agent results — triggered accounts appear here and jump the queue." />
          ) : (
            <ul className="divide-y divide-[--color-border]">
              {triggered.map((l) => (
                <li key={l.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <TriggerBadge trigger={l.trigger} />
                  </div>
                  <p className="mono mt-0.5 truncate text-xs text-[--color-text-faint]">
                    {l.trigger?.evidence}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}
