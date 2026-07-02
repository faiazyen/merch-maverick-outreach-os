import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Exa web search proxy (BYOK). Used by Account Radar to find live triggers.

export async function POST(req: NextRequest) {
  let body: { apiKey: string; query: string; numResults?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { apiKey, query, numResults = 5 } = body;
  if (!apiKey) return NextResponse.json({ error: "Missing Exa API key — add it in Settings." }, { status: 400 });
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  try {
    const r = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: { "x-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        query,
        numResults,
        type: "auto",
        contents: { text: { maxCharacters: 600 } },
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data?.error || `Exa error ${r.status}` }, { status: r.status });
    }
    const results = (data.results || []).map(
      (x: { title: string; url: string; publishedDate?: string; text?: string }) => ({
        title: x.title,
        url: x.url,
        date: x.publishedDate || "",
        snippet: x.text || "",
      }),
    );
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Exa request failed" },
      { status: 502 },
    );
  }
}
