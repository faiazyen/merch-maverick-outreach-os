"use client";

import type { Settings } from "./types";

// Client helper: calls our BYOK proxy with keys from local Settings.

export async function llm(
  settings: Settings,
  prompt: string,
  opts: { system?: string; maxTokens?: number } = {},
): Promise<string> {
  const provider = settings.llmProvider;
  const key =
    provider === "anthropic"
      ? settings.anthropicKey
      : provider === "openai"
        ? settings.openaiKey
        : settings.openrouterKey;
  const model =
    provider === "anthropic"
      ? settings.anthropicModel
      : provider === "openai"
        ? settings.openaiModel
        : settings.openrouterModel;

  if (!key) {
    throw new Error(
      `No ${provider} API key configured. Add one in Settings, or use Manual mode (paste agent output).`,
    );
  }

  const r = await fetch("/api/llm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider, apiKey: key, model, prompt, ...opts }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `LLM request failed (${r.status})`);
  return data.text as string;
}

// Robust JSON extraction from LLM output (handles ```json fences, prose wrap)
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model output");
  // walk back from end to find matching close
  for (let end = candidate.length; end > start; end--) {
    const slice = candidate.slice(start, end).trim();
    if (!slice.endsWith("}") && !slice.endsWith("]")) continue;
    try {
      return JSON.parse(slice) as T;
    } catch {
      /* keep shrinking */
    }
  }
  throw new Error("Could not parse JSON from model output");
}

export function gmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
