"use client";

import { useMemo, useState } from "react";
import {
  useStore,
  newLead,
  upsertLead,
  removeLead,
  importCsv,
} from "@/lib/store";
import { ruleScore } from "@/lib/scoring";
import { llm, extractJson } from "@/lib/llm";
import { scoringPrompt } from "@/lib/prompts";
import type { Lead, Stage, TriggerType } from "@/lib/types";
import { STAGES, TRIGGER_TYPES } from "@/lib/types";
import {
  PageHeader,
  ScorePair,
  RouteBadge,
  StageBadge,
  TierBadge,
  TriggerBadge,
  Empty,
  Toast,
} from "@/components/ui";
import { Plus, Upload, Gauge, Sparkles, Trash2, X } from "lucide-react";

export default function LeadsPage() {
  const { data } = useStore();
  const [filter, setFilter] = useState({ niche: "", stage: "", q: "" });
  const [editing, setEditing] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", error: false });
  const [busy, setBusy] = useState(false);

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };

  const leads = useMemo(() => {
    return data.leads.filter((l) => {
      if (filter.niche && l.niche !== filter.niche) return false;
      if (filter.stage && l.stage !== filter.stage) return false;
      if (filter.q) {
        const q = filter.q.toLowerCase();
        if (![l.name, l.city, l.email, l.contactPerson].join(" ").toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [data.leads, filter]);

  function scoreAllRules() {
    let n = 0;
    for (const l of data.leads) {
      const { fit, intent, reason } = ruleScore(l);
      upsertLead({ ...l, fit, intent, scoreReason: reason, stage: l.stage === "MINED" || l.stage === "ENRICHED" ? "SCORED" : l.stage });
      n++;
    }
    say(`Rule-scored ${n} leads (deterministic pass — refine with AI per lead).`);
  }

  async function scoreWithAI(lead: Lead) {
    setBusy(true);
    try {
      const niche = data.niches.find((n) => n.id === lead.niche);
      const text = await llm(data.settings, scoringPrompt(lead, niche), { maxTokens: 400 });
      const parsed = extractJson<{ fit: number; intent: number; trigger: TriggerType; reason: string }>(text);
      upsertLead({
        ...lead,
        fit: Math.round(parsed.fit),
        intent: Math.round(parsed.intent),
        scoreReason: parsed.reason,
        trigger:
          parsed.trigger && parsed.trigger !== "NONE"
            ? { type: parsed.trigger, evidence: parsed.reason, date: new Date().toISOString() }
            : lead.trigger,
        stage: ["MINED", "ENRICHED"].includes(lead.stage) ? "SCORED" : lead.stage,
      });
      say(`AI scored ${lead.name}: F${Math.round(parsed.fit)} / I${Math.round(parsed.intent)}`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Scoring failed", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${data.leads.length} accounts · filter, score, and route.`}>
        <button className="btn btn-ghost" onClick={() => setImportOpen(true)}>
          <Upload size={15} /> Import CSV
        </button>
        <button className="btn btn-ghost" onClick={scoreAllRules}>
          <Gauge size={15} /> Rule-score all
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setEditing(newLead({ niche: data.niches[0]?.id || "", tier: 1 }))}
        >
          <Plus size={15} /> Add lead
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input max-w-60"
          placeholder="Search name, city, contact…"
          value={filter.q}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          aria-label="Search leads"
        />
        <select
          className="select max-w-52"
          value={filter.niche}
          onChange={(e) => setFilter({ ...filter, niche: e.target.value })}
          aria-label="Filter by niche"
        >
          <option value="">All niches</option>
          {data.niches.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
        <select
          className="select max-w-44"
          value={filter.stage}
          onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
          aria-label="Filter by stage"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {leads.length === 0 ? (
        <Empty
          title="No leads match"
          hint="Add your first lead, import a CSV (columns: name,email,niche,city,country,instagram,website), or clear filters."
        />
      ) : (
        <div className="card overflow-auto" style={{ maxHeight: "calc(100dvh - 240px)" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Account</th>
                <th>Niche</th>
                <th>Geo</th>
                <th>Score</th>
                <th>Route</th>
                <th>Trigger</th>
                <th>Stage</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <button
                      className="cursor-pointer text-left font-medium hover:text-[--color-accent]"
                      onClick={() => setEditing(l)}
                    >
                      {l.name}
                    </button>
                    <p className="mono text-xs text-[--color-text-faint]">{l.email || l.instagram || "no contact"}</p>
                  </td>
                  <td>
                    <TierBadge tier={l.tier} />{" "}
                    <span className="mono text-xs text-[--color-text-dim]">{l.niche}</span>
                  </td>
                  <td className="mono text-xs text-[--color-text-dim]">
                    {l.city || "—"}{l.country ? `, ${l.country}` : ""}
                  </td>
                  <td><ScorePair fit={l.fit} intent={l.intent} /></td>
                  <td><RouteBadge fit={l.fit} intent={l.intent} /></td>
                  <td><TriggerBadge trigger={l.trigger} /></td>
                  <td><StageBadge stage={l.stage} /></td>
                  <td>
                    <button
                      className="btn btn-ghost !px-2 !py-1"
                      title="AI score this lead"
                      aria-label={`AI score ${l.name}`}
                      disabled={busy}
                      onClick={() => scoreWithAI(l)}
                    >
                      <Sparkles size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <LeadEditor
          lead={editing}
          niches={data.niches.map((n) => ({ id: n.id, label: n.label }))}
          onClose={() => setEditing(null)}
          onSave={(l) => {
            upsertLead(l);
            setEditing(null);
            say("Lead saved.");
          }}
          onDelete={(id) => {
            removeLead(id);
            setEditing(null);
            say("Lead deleted.");
          }}
        />
      )}

      {importOpen && (
        <CsvImporter
          niches={data.niches.map((n) => ({ id: n.id, label: n.label }))}
          onClose={() => setImportOpen(false)}
          onImport={(csv, niche, tier) => {
            const n = importCsv(csv, niche, tier);
            setImportOpen(false);
            say(n > 0 ? `Imported ${n} leads.` : "Nothing imported — check the CSV header.", n === 0);
          }}
        />
      )}

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}

// ─── Lead editor modal ───────────────────────────────────────────────────────

function LeadEditor({
  lead,
  niches,
  onClose,
  onSave,
  onDelete,
}: {
  lead: Lead;
  niches: { id: string; label: string }[];
  onClose: () => void;
  onSave: (l: Lead) => void;
  onDelete: (id: string) => void;
}) {
  const [l, setL] = useState<Lead>({ ...lead });
  const set = (patch: Partial<Lead>) => setL({ ...l, ...patch });
  const isNew = !lead.name;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Edit lead">
      <div className="card max-h-[90dvh] w-full max-w-2xl overflow-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isNew ? "Add lead" : l.name}</h2>
          <button className="btn btn-ghost !px-2" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Business name *</label>
            <input className="input" value={l.name} onChange={(e) => set({ name: e.target.value })} />
          </div>
          <div>
            <label className="label">Niche</label>
            <select className="select" value={l.niche} onChange={(e) => set({ niche: e.target.value })}>
              {niches.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tier</label>
            <select className="select" value={l.tier} onChange={(e) => set({ tier: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>Tier 1 — bet now</option>
              <option value={2}>Tier 2 — fast follow</option>
              <option value={3}>Tier 3 — leverage</option>
            </select>
          </div>
          <div>
            <label className="label">Contact person</label>
            <input className="input" value={l.contactPerson} onChange={(e) => set({ contactPerson: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={l.contactRole} onChange={(e) => set({ contactRole: e.target.value })} placeholder="owner / GM / head coach" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={l.email} onChange={(e) => set({ email: e.target.value })} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" value={l.instagram} onChange={(e) => set({ instagram: e.target.value })} placeholder="@handle" />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={l.website} onChange={(e) => set({ website: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">City</label>
              <input className="input" value={l.city} onChange={(e) => set({ city: e.target.value })} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" value={l.country} onChange={(e) => set({ country: e.target.value })} placeholder="NL" maxLength={2} />
            </div>
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="select" value={l.stage} onChange={(e) => set({ stage: e.target.value as Stage })}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Trigger</label>
            <select
              className="select"
              value={l.trigger?.type || "NONE"}
              onChange={(e) => {
                const t = e.target.value as TriggerType;
                set({
                  trigger:
                    t === "NONE"
                      ? null
                      : { type: t, evidence: l.trigger?.evidence || "", date: l.trigger?.date || new Date().toISOString() },
                });
              }}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {l.trigger && (
            <div className="sm:col-span-2">
              <label className="label">Trigger evidence</label>
              <input
                className="input"
                value={l.trigger.evidence}
                onChange={(e) => set({ trigger: { ...l.trigger!, evidence: e.target.value } })}
                placeholder="e.g. on hyrox.com Rotterdam roster, March 14"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="textarea" rows={3} value={l.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        {l.scoreReason && (
          <p className="mono mt-4 text-xs text-[--color-text-faint]">Score basis: {l.scoreReason}</p>
        )}

        <div className="mt-6 flex justify-between">
          {!isNew ? (
            <button className="btn btn-danger" onClick={() => { if (confirm(`Delete ${l.name}?`)) onDelete(l.id); }}>
              <Trash2 size={14} /> Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!l.name.trim()} onClick={() => onSave(l)}>
              Save lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CSV importer modal ──────────────────────────────────────────────────────

function CsvImporter({
  niches,
  onClose,
  onImport,
}: {
  niches: { id: string; label: string }[];
  onClose: () => void;
  onImport: (csv: string, niche: string, tier: 1 | 2 | 3) => void;
}) {
  const [csv, setCsv] = useState("");
  const [niche, setNiche] = useState(niches[0]?.id || "");
  const [tier, setTier] = useState<1 | 2 | 3>(1);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Import CSV">
      <div className="card w-full max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Import leads (CSV)</h2>
          <button className="btn btn-ghost !px-2" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-sm text-[--color-text-dim]">
          Paste CSV with a header row. Recognized columns:{" "}
          <span className="mono text-xs">name, email, niche, city, country, instagram, website, contactperson, contactrole</span>.
          Works directly with Apify Google Maps exports (rename columns to match).
        </p>
        <textarea
          className="textarea"
          rows={10}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={"name,email,city,country\nForge Athletics,info@forge.nl,Rotterdam,NL"}
        />
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label className="label">Default niche (when column missing)</label>
            <select className="select" value={niche} onChange={(e) => setNiche(e.target.value)}>
              {niches.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tier</label>
            <select className="select" value={tier} onChange={(e) => setTier(Number(e.target.value) as 1 | 2 | 3)}>
              <option value={1}>T1</option>
              <option value={2}>T2</option>
              <option value={3}>T3</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={!csv.trim()} onClick={() => onImport(csv, niche, tier)}>
            <Upload size={15} /> Import
          </button>
        </div>
      </div>
    </div>
  );
}
