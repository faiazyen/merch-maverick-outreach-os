"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { AppData, Lead, Niche, Settings, Stage } from "./types";
import { DEFAULT_SETTINGS, SEED_NICHES } from "./seed";

const KEY = "outreach-os-v1";

// ─── Core store: localStorage-backed, subscribable ─────────────────────────
// v1 design decision: client-side persistence = zero infra, deploys anywhere.
// Export/Import JSON gives durability; upgrade path is Supabase/Postgres.

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function fresh(): AppData {
  return {
    leads: [],
    niches: SEED_NICHES,
    settings: DEFAULT_SETTINGS,
    version: 1,
  };
}

export function load(): AppData {
  if (cache) return cache;
  if (typeof window === "undefined") return fresh();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      cache = fresh();
    } else {
      const parsed = JSON.parse(raw) as AppData;
      // merge new seed niches + settings keys added in later versions
      const ids = new Set(parsed.niches.map((n) => n.id));
      for (const n of SEED_NICHES) if (!ids.has(n.id)) parsed.niches.push(n);
      parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
      cache = parsed;
    }
  } catch {
    cache = fresh();
  }
  return cache;
}

function persist() {
  if (cache && typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  }
  listeners.forEach((l) => l());
}

export function mutate(fn: (d: AppData) => void) {
  const d = load();
  fn(d);
  // fresh references at every level consumers depend on — keeps useMemo deps honest
  cache = { ...d, leads: [...d.leads], niches: [...d.niches], settings: { ...d.settings } };
  persist();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const serverSnapshot = fresh();

export function useAppData(): AppData {
  return useSyncExternalStore(
    subscribe,
    () => load(),
    () => serverSnapshot,
  );
}

// ─── Domain helpers ─────────────────────────────────────────────────────────

export function newLead(partial: Partial<Lead>): Lead {
  const now = new Date().toISOString();
  return {
    id: `${partial.niche || "lead"}-${Math.random().toString(36).slice(2, 8)}`,
    niche: "",
    tier: 1,
    name: "",
    contactPerson: "",
    contactRole: "",
    email: "",
    instagram: "",
    website: "",
    city: "",
    country: "",
    fit: null,
    intent: null,
    scoreReason: "",
    trigger: null,
    stage: "MINED",
    sequence: { template: "T1-CLUB", touch: 0, lastSent: null },
    draft: null,
    history: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function upsertLead(lead: Lead) {
  mutate((d) => {
    const i = d.leads.findIndex((l) => l.id === lead.id);
    lead.updatedAt = new Date().toISOString();
    if (i >= 0) d.leads[i] = lead;
    else d.leads.unshift(lead);
  });
}

export function removeLead(id: string) {
  mutate((d) => {
    d.leads = d.leads.filter((l) => l.id !== id);
  });
}

export function setStage(id: string, stage: Stage, detail = "") {
  mutate((d) => {
    const l = d.leads.find((x) => x.id === id);
    if (!l) return;
    l.stage = stage;
    l.updatedAt = new Date().toISOString();
    l.history.push({
      at: l.updatedAt,
      kind: "STAGE",
      detail: detail || `→ ${stage}`,
    });
  });
}

export function updateSettings(patch: Partial<Settings>) {
  mutate((d) => {
    d.settings = { ...d.settings, ...patch };
  });
}

export function upsertNiche(niche: Niche) {
  mutate((d) => {
    const i = d.niches.findIndex((n) => n.id === niche.id);
    if (i >= 0) d.niches[i] = niche;
    else d.niches.push(niche);
  });
}

export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJson(raw: string): { ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (!Array.isArray(parsed.leads) || !Array.isArray(parsed.niches)) {
      return { ok: false, error: "Not a valid Outreach OS export." };
    }
    cache = { ...fresh(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
    persist();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Parse error" };
  }
}

// CSV import: header row → Lead fields (name,email,niche,city,country,instagram,website,contactPerson,contactRole)
export function importCsv(raw: string, defaultNiche: string, tier: 1 | 2 | 3): number {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return 0;
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (k: string) => headers.indexOf(k);
  let count = 0;
  mutate((d) => {
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;
      // naive CSV split is fine for simple exports; quoted-comma edge cases go through JSON import
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const get = (k: string) => (idx(k) >= 0 ? cols[idx(k)] || "" : "");
      const name = get("name");
      if (!name) continue;
      d.leads.unshift(
        newLead({
          name,
          email: get("email"),
          niche: get("niche") || defaultNiche,
          tier,
          city: get("city"),
          country: get("country"),
          instagram: get("instagram"),
          website: get("website"),
          contactPerson: get("contactperson") || get("contact"),
          contactRole: get("contactrole") || get("role"),
        }),
      );
      count++;
    }
  });
  return count;
}

export function useStore() {
  const data = useAppData();
  const refresh = useCallback(() => listeners.forEach((l) => l()), []);
  return { data, refresh };
}
