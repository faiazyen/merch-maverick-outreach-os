"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (r.ok) router.push("/");
    else setError("Wrong access code.");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-dim] text-[--color-accent]">
            <Lock size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Outreach OS</h1>
            <p className="text-xs text-[--color-text-dim]">Merch Maverick — private</p>
          </div>
        </div>
        <label className="label" htmlFor="code">
          Access code
        </label>
        <input
          id="code"
          type="password"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-[--color-red]">{error}</p>}
        <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={busy}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
