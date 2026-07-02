import type { Niche, Settings } from "./types";

// Seeded from the 2026-07-02 Google Trends research run (Apify, 5y worldwide):
// named micro-communities breaking out across all Tier 1 niches.
export const SEED_NICHES: Niche[] = [
  {
    id: "hyrox-gym",
    label: "Hyrox Gyms",
    tier: 1,
    icp: `Buyer: gym owner / head coach. Trigger: event registration (hyrox.com city rosters are public).
Breakout cities (Trends): Paris, Rotterdam, Barcelona, Dublin, Stockholm, Utrecht, Rimini, Toulouse, Bordeaux, Lyon.
"hyrox relay" = gyms field teams → matching race kits, 6–30 units, hard deadline (race day).
Offer: Race-Ready Team Kit — air-freighted, on-time or free.`,
    phrasebank: `our kit arrived after race day
MOQ was 500 so we never bothered
the print cracked after two washes
we just raced in plain black tees
nobody could tell we were one team`,
    sequenceTemplate: "T1-EVENT",
  },
  {
    id: "run-club",
    label: "Run Clubs",
    tier: 1,
    icp: `Buyer: club founder/organizer (often IG-first). Named clubs breaking out globally (diplo, puresport, rawdawg, mad miles, unfit...).
Clubs of 30–200 members want identity merch; killed by MOQs today.
Offer: Your Club, Your Brand, Zero Inventory — founding drop at factory price, one-click reorders.`,
    phrasebank: `we're 40 people, no supplier takes us seriously
everyone keeps asking where to get the club tee
we did one drop and never reordered, too painful
our logo on a decent hoodie shouldn't cost €60`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "padel-club",
    label: "Padel Clubs",
    tier: 1,
    icp: `Buyer: club owner / GM. Trends: "padel courts near me" +950%, "padel pro shop" +900%, "padel teams" +1,050%.
New clubs opening across NL/DE/ES/UK; each wants house-brand pro-shop margin but can't do factory MOQs.
Offer: Pro-Shop-in-a-Box — house-brand capsule at factory price, sell at 3x, one-click restock.`,
    phrasebank: `the pro shop is empty except racket brands
we want our own club line but minimums are brutal
members would buy club merch tomorrow if we had it`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "reformer-studio",
    label: "Reformer Pilates Studios",
    tier: 1,
    icp: `Buyer: studio owner. Trends: openings wave across Köln, Hamburg, Frankfurt, Wien, München, Berlin, Budapest.
"pilates socks +250%", "reformer pilates socks +200%" still rising — studio-branded grip socks = retail margin.
Offer: Studio Launch Kit — staff uniforms + retail capsule of branded grip socks.`,
    phrasebank: `clients buy grip socks on amazon, not from us
we opened last month and still have no staff kit
the aesthetic matters more than the price`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "supper-club",
    label: "Supper Clubs & Venues",
    tier: 1,
    icp: `Buyer: founder/chef-owner. Trends: 20/25 rising queries are NAMED venues — hospitality micro-brands exploding.
Offer: Identity Kit — aprons, caps, totes, staff wear guests beg to buy.`,
    phrasebank: `guests ask to buy the aprons
we look like a pop-up, we want to look like a cult
merch is the only marketing that pays for itself`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "bouldering-gym",
    label: "Bouldering Gyms",
    tier: 2,
    icp: `Named gyms breaking out (City Bouldering, Bouldering Project cities, 1Up). Olympics tailwind. Chalk bags, tees, caps.`,
    phrasebank: `members wear our tee on every crag
the merch wall sells out and we never restock`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "sauna-studio",
    label: "Sauna & Recovery Studios",
    tier: 2,
    icp: `"perspire sauna studio +500%" (franchise), "sauna hat +300%" — the grippy sock of sauna culture. Robes, towels, hats.`,
    phrasebank: `people bring their own sauna hats now
towels walk out the door, might as well brand them`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "golf-sim-lounge",
    label: "Golf Sim Lounges",
    tier: 2,
    icp: `"24/7 golf simulator +950%", "commercial golf simulator" rising. Polos, caps, towels, ball markers.`,
    phrasebank: `we want country-club merch presence at strip-mall cost`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "matcha-cafe",
    label: "Matcha Cafés",
    tier: 2,
    icp: `Named cafés breaking out (Rocky's, Nami, Maison...). "That girl" aesthetic in venue form. Totes, caps, barista aprons.`,
    phrasebank: `our tote would be on every morning-routine reel
the cup is the billboard, the tote is the subscription`,
    sequenceTemplate: "T1-CLUB",
  },
  {
    id: "franchise",
    label: "Franchises & Agencies (leverage)",
    tier: 3,
    icp: `Perspire, Ace Pickleball Club, Pickleball Kingdom breaking out. One deal = 50 locations recurring. Also brand-activation agencies (Gymshark/Hoka run clubs pattern).`,
    phrasebank: `every location orders separately and it's chaos
we need one supplier who ships to 30 sites`,
    sequenceTemplate: "T1-CLUB",
  },
];

export const DEFAULT_VOICE = `Direct, warm, confident. No fluff. Short sentences, short paragraphs (2–3 lines max).
Contractions always (I'm, we'd, it's). "Thanks" not "Thank you". Sign off "Faiaz".
Never: "I hope this finds you well", "quick question", fake "re:", buzzwords, feature lists.
Always propose specific times — never "when works for you?".
Every email: name the trigger specifically, echo one buyer phrase, one risk-reversal offer, one CTA.`;

export const DEFAULT_SIGNATURE = `Faiaz Mazumder
CEO & Founder
Merch Maverick
themerchmaverick.com`;

export const DEFAULT_SETTINGS: Settings = {
  llmProvider: "anthropic",
  anthropicKey: "",
  anthropicModel: "claude-opus-4-8",
  openaiKey: "",
  openaiModel: "gpt-5",
  openrouterKey: "",
  openrouterModel: "anthropic/claude-opus-4.8",
  searchProvider: "manual",
  exaKey: "",
  senderName: "Faiaz Mazumder",
  senderEmail: "",
  signature: DEFAULT_SIGNATURE,
  voiceFile: DEFAULT_VOICE,
  dailyQueueSize: 30,
  smtpEnabled: false,
  smtpUser: "",
  smtpAppPassword: "",
};
