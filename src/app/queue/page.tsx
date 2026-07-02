"use client";

import { useMemo, useState } from "react";
import { useStore, upsertLead, setStage } from "@/lib/store";
import { priority, route } from "@/lib/scoring";
import { gmailComposeUrl } from "@/lib/llm";
import { PageHeader, ScorePair, TriggerBadge, RouteBadge, Empty, Toast } from "@/components/ui";
import { Mail, Check, Reply, ClipboardCopy, Zap, X } from "lucide-react";

// The Queue: today's ranked send list. Human presses send — Gmail compose
// deep-link (primary) or optional in-app SMTP send (App Password).

export default function QueuePage() {
  const { data } = useStore();
  const [toast, setToast] = useState({ msg: "", error: false });
  const [busy, setBusy] = useState<string | null>(null);

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };

  const queue = useMemo(
    () =>
      data.leads
        .filter((l) => l.draft?.subject && l.draft?.body)
        .filter((l) => ["QUEUED", "SCORED", "ENRICHED"].includes(l.stage))
        .sort((a, b) => priority(b) - priority(a))
        .slice(0, data.settings.dailyQueueSize),
    [data.leads, data.settings.dailyQueueSize],
  );

  const sentToday = data.leads.filter(
    (l) => l.sequence.lastSent && l.sequence.lastSent.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length;

  function fullBody(l: (typeof queue)[number]): string {
    return `${l.draft!.body}\n\n${data.settings.signature}`;
  }

  function markSent(id: string) {
    const l = data.leads.find((x) => x.id === id);
    if (!l) return;
    const now = new Date().toISOString();
    upsertLead({
      ...l,
      stage: "CONTACTED",
      sequence: { ...l.sequence, touch: l.sequence.touch + 1, lastSent: now },
      history: [...l.history, { at: now, kind: "SENT", detail: `touch ${l.sequence.touch + 1}: ${l.draft?.subject}` }],
    });
    say("Marked sent — sequence advanced.");
  }

  async function smtpSend(id: string) {
    const l = data.leads.find((x) => x.id === id);
    if (!l || !l.draft) return;
    if (!data.settings.smtpEnabled || !data.settings.smtpUser || !data.settings.smtpAppPassword) {
      say("SMTP not configured — enable it in Settings or use the Gmail button.", true);
      return;
    }
    setBusy(id);
    try {
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          smtpUser: data.settings.smtpUser,
          smtpAppPassword: data.settings.smtpAppPassword,
          fromName: data.settings.senderName,
          to: l.email,
          subject: l.draft.subject,
          text: fullBody(l),
        }),
      });
      const res = await r.json();
      if (!r.ok) throw new Error(res.error);
      markSent(id);
      say(`Sent to ${l.name} via Gmail SMTP.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Send failed", true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Today's Queue"
        subtitle={`${queue.length} drafts ready · ${sentToday}/${data.settings.dailyQueueSize} sent today. Review, personalize, send.`}
      />

      {queue.length === 0 ? (
        <Empty
          title="Queue is empty"
          hint="Drafts land here from the Ghostwriter. Score leads → find triggers → draft → send."
        />
      ) : (
        <div className="space-y-4">
          {queue.map((l, i) => (
            <article key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="mono text-xs text-[--color-text-faint]">#{i + 1}</span>
                    <h2 className="truncate font-bold">{l.name}</h2>
                    <ScorePair fit={l.fit} intent={l.intent} />
                    <RouteBadge fit={l.fit} intent={l.intent} />
                    <TriggerBadge trigger={l.trigger} />
                  </div>
                  <p className="mono mt-1 text-xs text-[--color-text-faint]">
                    to: {l.email || "⚠ NO EMAIL — add one in Leads"} · touch {l.sequence.touch + 1} ·{" "}
                    {l.niche}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`Subject: ${l.draft!.subject}\n\n${fullBody(l)}`);
                      say("Email copied to clipboard.");
                    }}
                  >
                    <ClipboardCopy size={14} /> Copy
                  </button>
                  <a
                    className={`btn btn-primary ${!l.email ? "pointer-events-none opacity-45" : ""}`}
                    href={l.email ? gmailComposeUrl(l.email, l.draft!.subject, fullBody(l)) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!l.email}
                  >
                    <Mail size={14} /> Open in Gmail
                  </a>
                  {data.settings.smtpEnabled && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => smtpSend(l.id)}
                      disabled={busy === l.id || !l.email}
                      title="Send now via Gmail SMTP (App Password)"
                    >
                      <Zap size={14} /> {busy === l.id ? "Sending…" : "Send now"}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[--color-border] bg-[--color-surface-2] p-4">
                <p className="mono mb-2 text-xs text-[--color-text-dim]">
                  subject: <span className="text-[--color-text]">{l.draft!.subject}</span>
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-[--color-text]">
                  {l.draft!.body}
                </pre>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-ghost" onClick={() => markSent(l.id)}>
                  <Check size={14} /> Mark sent
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setStage(l.id, "ENGAGED", "reply received");
                    say("Marked replied — moved to ENGAGED.");
                  }}
                >
                  <Reply size={14} /> Got reply
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setStage(l.id, "NURTURE", "pulled from queue");
                    say("Moved to nurture.");
                  }}
                >
                  <X size={14} /> Pull from queue
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="card mt-6 p-5" aria-label="Deliverability guardrails">
        <p className="mono text-xs leading-6 text-[--color-text-faint]">
          GUARDRAILS · max {data.settings.dailyQueueSize}/day cold · plain text, no links on touch 1 ·
          spread sends 9:00–17:00 recipient-local · reply rate &lt;2% after 100 sends in a niche →
          stop and rewrite · any &quot;remove me&quot; → suppress forever.
        </p>
      </section>

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}
