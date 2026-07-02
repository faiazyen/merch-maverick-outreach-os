import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// BYOK proxy: the browser sends the user's own API key per-request.
// Keys are never stored server-side; this route only relays to the provider
// (avoids CORS and keeps keys out of client-visible third-party requests).

interface LlmRequest {
  provider: "anthropic" | "openai" | "openrouter";
  apiKey: string;
  model: string;
  prompt: string;
  system?: string;
  maxTokens?: number;
}

export async function POST(req: NextRequest) {
  let body: LlmRequest;
  try {
    body = (await req.json()) as LlmRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { provider, apiKey, model, prompt, system, maxTokens = 2048 } = body;
  if (!apiKey) return NextResponse.json({ error: "Missing API key — add it in Settings." }, { status: 400 });
  if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

  try {
    if (provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        return NextResponse.json(
          { error: data?.error?.message || `Anthropic error ${r.status}` },
          { status: r.status },
        );
      }
      const text = (data.content || [])
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");
      return NextResponse.json({ text });
    }

    // OpenAI and OpenRouter share the chat-completions shape
    const base =
      provider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";

    const r = await fetch(base, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        ...(provider === "openrouter"
          ? { "HTTP-Referer": "https://outreach-os.local", "X-Title": "Merch Maverick Outreach OS" }
          : {}),
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: maxTokens,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: data?.error?.message || `${provider} error ${r.status}` },
        { status: r.status },
      );
    }
    return NextResponse.json({ text: data.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream request failed" },
      { status: 502 },
    );
  }
}
