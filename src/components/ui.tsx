"use client";

import type { Stage, TriggerType } from "@/lib/types";
import { route } from "@/lib/scoring";

export function ScorePair({ fit, intent }: { fit: number | null; intent: number | null }) {
  const color = (v: number | null) =>
    v === null
      ? "text-[--color-text-faint]"
      : v >= 70
        ? "text-[--color-accent]"
        : v >= 40
          ? "text-[--color-amber]"
          : "text-[--color-text-dim]";
  return (
    <span className="mono text-xs">
      <span className={color(fit)}>F{fit ?? "–"}</span>
      <span className="text-[--color-text-faint]"> / </span>
      <span className={color(intent)}>I{intent ?? "–"}</span>
    </span>
  );
}

const ROUTE_STYLE: Record<string, string> = {
  TODAY: "border-[#34d3a655] bg-[#34d3a612] text-[--color-accent]",
  THIS_WEEK: "border-[#d2992255] bg-[#d2992212] text-[--color-amber]",
  NURTURE: "border-[#58a6ff55] bg-[#58a6ff12] text-[--color-blue]",
  ARCHIVE: "border-[--color-border] text-[--color-text-faint]",
  DISCARD: "border-[#f8514955] text-[--color-red]",
};

export function RouteBadge({ fit, intent }: { fit: number | null; intent: number | null }) {
  if (fit === null && intent === null)
    return <span className="badge border-[--color-border] text-[--color-text-faint]">UNSCORED</span>;
  const r = route(fit, intent);
  return <span className={`badge ${ROUTE_STYLE[r]}`}>{r.replace("_", " ")}</span>;
}

const STAGE_COLOR: Partial<Record<Stage, string>> = {
  FOUNDING_CLIENT: "border-[#34d3a655] text-[--color-accent]",
  MEETING: "border-[#bc8cff55] text-[--color-purple]",
  ENGAGED: "border-[#58a6ff55] text-[--color-blue]",
  QUOTE_SENT: "border-[#58a6ff55] text-[--color-blue]",
  CONTACTED: "border-[#d2992255] text-[--color-amber]",
  DEAD: "border-[#f8514955] text-[--color-red]",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`badge ${STAGE_COLOR[stage] || "border-[--color-border] text-[--color-text-dim]"}`}>
      {stage.replace("_", " ")}
    </span>
  );
}

export function TierBadge({ tier }: { tier: 1 | 2 | 3 }) {
  const style =
    tier === 1
      ? "border-[#34d3a655] text-[--color-accent]"
      : tier === 2
        ? "border-[#d2992255] text-[--color-amber]"
        : "border-[--color-border] text-[--color-text-dim]";
  return <span className={`badge ${style}`}>T{tier}</span>;
}

export function TriggerBadge({ trigger }: { trigger: { type: TriggerType } | null }) {
  if (!trigger || trigger.type === "NONE")
    return <span className="text-xs text-[--color-text-faint]">—</span>;
  return (
    <span className="badge border-[#bc8cff55] bg-[#bc8cff10] text-[--color-purple]">
      {trigger.type}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-[--color-text-dim]">{subtitle}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-semibold text-[--color-text-dim]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[--color-text-faint]">{hint}</p>
    </div>
  );
}

export function Toast({ msg, error }: { msg: string; error?: boolean }) {
  if (!msg) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-2xl ${
        error
          ? "border-[#f8514955] bg-[#2a1214] text-[--color-red]"
          : "border-[#34d3a655] bg-[#0c211a] text-[--color-accent]"
      }`}
    >
      {msg}
    </div>
  );
}
