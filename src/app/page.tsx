"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { route } from "@/lib/scoring";
import { PageHeader, StageBadge } from "@/components/ui";
import { ArrowRight, Users, Send, Reply, Trophy } from "lucide-react";

export default function Dashboard() {
  const { data } = useStore();
  const { leads } = data;

  const today = leads.filter(
    (l) => route(l.fit, l.intent) === "TODAY" && ["SCORED", "QUEUED", "ENRICHED"].includes(l.stage),
  ).length;
  const contacted = leads.filter((l) =>
    ["CONTACTED", "ENGAGED", "MEETING", "QUOTE_SENT", "FOUNDING_CLIENT"].includes(l.stage),
  ).length;
  const replied = leads.filter((l) =>
    ["ENGAGED", "MEETING", "QUOTE_SENT", "FOUNDING_CLIENT"].includes(l.stage),
  ).length;
  const won = leads.filter((l) => l.stage === "FOUNDING_CLIENT").length;
  const replyRate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

  const stats = [
    { label: "Total leads", value: leads.length, icon: Users, color: "text-[--color-blue]" },
    { label: "Ready today", value: today, icon: Send, color: "text-[--color-accent]" },
    { label: "Reply rate", value: `${replyRate}%`, icon: Reply, color: "text-[--color-amber]" },
    { label: "Founding clients", value: won, icon: Trophy, color: "text-[--color-purple]" },
  ];

  const recent = [...leads]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  const funnel: { stage: string; n: number }[] = [
    "MINED",
    "SCORED",
    "CONTACTED",
    "ENGAGED",
    "MEETING",
    "FOUNDING_CLIENT",
  ].map((s) => ({
    stage: s,
    n: leads.filter((l) =>
      s === "MINED"
        ? ["MINED", "ENRICHED"].includes(l.stage)
        : s === "SCORED"
          ? ["SCORED", "QUEUED"].includes(l.stage)
          : l.stage === s,
    ).length,
  }));
  const maxN = Math.max(1, ...funnel.map((f) => f.n));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="North star: 30 quality sends/day → 6 founding clients/month."
      >
        <Link href="/queue" className="btn btn-primary">
          Open today&apos;s queue <ArrowRight size={15} />
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[--color-text-faint]">
                {label}
              </p>
              <Icon size={16} className={color} />
            </div>
            <p className="mono mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card p-6" aria-label="Pipeline funnel">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
            Pipeline
          </h2>
          <div className="space-y-3">
            {funnel.map(({ stage, n }) => (
              <div key={stage}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="mono text-[--color-text-dim]">{stage.replace("_", " ")}</span>
                  <span className="mono">{n}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[--color-surface-2]">
                  <div
                    className="h-full rounded-full bg-[--color-accent] transition-[width] duration-300"
                    style={{ width: `${(n / maxN) * 100}%`, opacity: n === 0 ? 0.15 : 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6" aria-label="Recent activity">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
            Recent activity
          </h2>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-[--color-text-faint]">
              No leads yet. Start in <Link href="/leads" className="text-[--color-accent] underline">Leads</Link> — import a CSV or add your first account.
            </p>
          ) : (
            <ul className="divide-y divide-[--color-border]">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="mono text-xs text-[--color-text-faint]">
                      {l.niche} · {l.city || "—"}
                    </p>
                  </div>
                  <StageBadge stage={l.stage} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card mt-6 p-6" aria-label="Operating ritual">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
          Daily ritual (45–60 min)
        </h2>
        <ol className="mono grid gap-2 text-sm text-[--color-text-dim] lg:grid-cols-4">
          <li>1 · Mine/import leads → <Link href="/leads" className="text-[--color-accent]">Leads</Link></li>
          <li>2 · Find triggers → <Link href="/radar" className="text-[--color-accent]">Radar</Link></li>
          <li>3 · Draft in your voice → <Link href="/writer" className="text-[--color-accent]">Ghostwriter</Link></li>
          <li>4 · Review &amp; send 30 → <Link href="/queue" className="text-[--color-accent]">Queue</Link></li>
        </ol>
      </section>
    </div>
  );
}
