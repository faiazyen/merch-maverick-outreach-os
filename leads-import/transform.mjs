#!/usr/bin/env node
// Transforms Apify Google Maps Email Extractor output (leads-raw.json)
// into Outreach OS import CSVs, split by tier/niche.
// Usage: node transform.mjs

import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(new URL("./leads-raw.json", import.meta.url), "utf8"));

// Map search query → OS niche id + tier
const NICHE_MAP = [
  { match: /crossfit|functional fitness/i, niche: "hyrox-gym", tier: 1 },
  { match: /padel/i, niche: "padel-club", tier: 1 },
  { match: /pilates/i, niche: "reformer-studio", tier: 1 },
  { match: /supper club/i, niche: "supper-club", tier: 1 },
  { match: /boulder|climbing/i, niche: "bouldering-gym", tier: 2 },
  { match: /sauna/i, niche: "sauna-studio", tier: 2 },
  { match: /golf/i, niche: "golf-sim-lounge", tier: 2 },
  { match: /matcha/i, niche: "matcha-cafe", tier: 2 },
];

const esc = (v) => {
  const s = String(v ?? "").trim();
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const seen = new Set();
const rows = [];
for (const p of raw) {
  if (p.permanentlyClosed || p.temporarilyClosed) continue;
  const key = p.placeId || `${p.title}|${p.city}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const m = NICHE_MAP.find((n) => n.match.test(p.searchString || "")) || { niche: "other", tier: 2 };
  const email = (p.emails || []).find((e) => e && !/example|sentry|wixpress|@2x|\.png|\.jpg/i.test(e)) || "";
  const ig = (p.instagrams || [])[0] || "";
  const igHandle = ig ? "@" + ig.replace(/\/+$/, "").split("/").pop().split("?")[0] : "";

  rows.push({
    name: p.title || "",
    email: email.toLowerCase(),
    niche: m.niche,
    tier: m.tier,
    city: p.city || "",
    country: (p.countryCode || "").toUpperCase(),
    instagram: igHandle,
    website: (p.website || "").replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 80),
    contactperson: "",
    contactrole: "owner",
    phone: p.phone || "",
    rating: p.totalScore ?? "",
    reviews: p.reviewsCount ?? "",
    query: p.searchString || "",
  });
}

const HEADER = "name,email,niche,city,country,instagram,website,contactperson,contactrole";
const line = (r) =>
  [r.name, r.email, r.niche, r.city, r.country, r.instagram, r.website, r.contactperson, r.contactrole]
    .map(esc)
    .join(",");

// Per-tier files for the OS importer
for (const tier of [1, 2]) {
  const subset = rows.filter((r) => r.tier === tier);
  writeFileSync(
    new URL(`./tier${tier}-leads.csv`, import.meta.url),
    [HEADER, ...subset.map(line)].join("\n") + "\n",
  );
}

// Master file (manual use: extra columns for triage)
const MASTER_HEADER = HEADER + ",tier,phone,rating,reviews,query,has_email";
writeFileSync(
  new URL("./master-all-leads.csv", import.meta.url),
  [
    MASTER_HEADER,
    ...rows.map(
      (r) => line(r) + "," + [r.tier, r.phone, r.rating, r.reviews, r.query, r.email ? "YES" : "no"].map(esc).join(","),
    ),
  ].join("\n") + "\n",
);

// Console summary
const byNiche = {};
for (const r of rows) {
  byNiche[r.niche] = byNiche[r.niche] || { total: 0, withEmail: 0 };
  byNiche[r.niche].total++;
  if (r.email) byNiche[r.niche].withEmail++;
}
console.log(`TOTAL: ${rows.length} unique places`);
for (const [n, s] of Object.entries(byNiche).sort()) {
  console.log(`  ${n.padEnd(18)} ${String(s.total).padStart(4)} leads, ${String(s.withEmail).padStart(4)} with email`);
}
