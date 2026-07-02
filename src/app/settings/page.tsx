"use client";

import { useRef, useState } from "react";
import { useStore, updateSettings, exportJson, importJson } from "@/lib/store";
import type { LlmProvider, SearchProvider } from "@/lib/types";
import { PageHeader, Toast } from "@/components/ui";
import { Download, Upload, KeyRound, Mic, Mail, Database } from "lucide-react";

export default function SettingsPage() {
  const { data } = useStore();
  const s = data.settings;
  const [toast, setToast] = useState({ msg: "", error: false });
  const fileRef = useRef<HTMLInputElement>(null);

  const say = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast({ msg: "", error: false }), 3500);
  };

  function downloadBackup() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    say("Backup downloaded.");
  }

  async function restoreBackup(file: File) {
    const text = await file.text();
    const r = importJson(text);
    say(r.ok ? "Backup restored." : r.error || "Restore failed", !r.ok);
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="BYOK — keys live in this browser only and are sent per-request to providers. Never stored server-side."
      />

      {/* ── AI providers ── */}
      <section className="card mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
          <KeyRound size={15} /> AI providers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Active LLM provider</label>
            <select
              className="select"
              value={s.llmProvider}
              onChange={(e) => updateSettings({ llmProvider: e.target.value as LlmProvider })}
            >
              <option value="anthropic">Claude (Anthropic)</option>
              <option value="openai">OpenAI (GPT-5)</option>
              <option value="openrouter">OpenRouter (any model)</option>
            </select>
          </div>
          <div />
          <div>
            <label className="label">Anthropic API key</label>
            <input className="input mono" type="password" value={s.anthropicKey} onChange={(e) => updateSettings({ anthropicKey: e.target.value })} placeholder="sk-ant-…" autoComplete="off" />
          </div>
          <div>
            <label className="label">Anthropic model</label>
            <input className="input mono" value={s.anthropicModel} onChange={(e) => updateSettings({ anthropicModel: e.target.value })} />
          </div>
          <div>
            <label className="label">OpenAI API key</label>
            <input className="input mono" type="password" value={s.openaiKey} onChange={(e) => updateSettings({ openaiKey: e.target.value })} placeholder="sk-…" autoComplete="off" />
          </div>
          <div>
            <label className="label">OpenAI model</label>
            <input className="input mono" value={s.openaiModel} onChange={(e) => updateSettings({ openaiModel: e.target.value })} />
          </div>
          <div>
            <label className="label">OpenRouter API key</label>
            <input className="input mono" type="password" value={s.openrouterKey} onChange={(e) => updateSettings({ openrouterKey: e.target.value })} placeholder="sk-or-…" autoComplete="off" />
          </div>
          <div>
            <label className="label">OpenRouter model</label>
            <input className="input mono" value={s.openrouterModel} onChange={(e) => updateSettings({ openrouterModel: e.target.value })} />
          </div>
        </div>

        <div className="mt-5 border-t border-[--color-border] pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Web research (Account Radar)</label>
              <select
                className="select"
                value={s.searchProvider}
                onChange={(e) => updateSettings({ searchProvider: e.target.value as SearchProvider })}
              >
                <option value="manual">Manual — paste from Perplexity (no key needed)</option>
                <option value="exa">Exa API (live web search)</option>
              </select>
            </div>
            {s.searchProvider === "exa" && (
              <div>
                <label className="label">Exa API key</label>
                <input className="input mono" type="password" value={s.exaKey} onChange={(e) => updateSettings({ exaKey: e.target.value })} autoComplete="off" />
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-[--color-text-faint]">
            Perplexity has no key? Every AI module has a &quot;Copy prompt&quot; button — run it in the
            Perplexity app, paste the JSON result back. The system treats both paths identically.
          </p>
        </div>
      </section>

      {/* ── Voice ── */}
      <section className="card mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
          <Mic size={15} /> Voice fingerprint
        </h2>
        <label className="label">How Faiaz writes (the Ghostwriter obeys this)</label>
        <textarea className="textarea" rows={7} value={s.voiceFile} onChange={(e) => updateSettings({ voiceFile: e.target.value })} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Sender name</label>
            <input className="input" value={s.senderName} onChange={(e) => updateSettings({ senderName: e.target.value })} />
          </div>
          <div>
            <label className="label">Daily queue size</label>
            <input
              className="input mono"
              type="number"
              min={5}
              max={50}
              value={s.dailyQueueSize}
              onChange={(e) => updateSettings({ dailyQueueSize: Math.max(5, Math.min(50, Number(e.target.value) || 30)) })}
            />
          </div>
        </div>
        <label className="label mt-4">Signature (appended to every email)</label>
        <textarea className="textarea" rows={4} value={s.signature} onChange={(e) => updateSettings({ signature: e.target.value })} />
      </section>

      {/* ── Gmail sending ── */}
      <section className="card mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
          <Mail size={15} /> Gmail sending
        </h2>
        <p className="mb-4 text-sm text-[--color-text-dim]">
          Default: &quot;Open in Gmail&quot; pre-fills a compose window in your Workspace account — you
          press send (best deliverability, zero setup). Optional: enable direct SMTP send with a Gmail{" "}
          <a
            className="text-[--color-accent] underline"
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
          >
            App Password
          </a>{" "}
          for one-click sends from the queue.
        </p>
        <label className="mb-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={s.smtpEnabled}
            onChange={(e) => updateSettings({ smtpEnabled: e.target.checked })}
            className="h-4 w-4 accent-[#34d3a6]"
          />
          <span className="text-sm font-medium">Enable in-app SMTP send</span>
        </label>
        {s.smtpEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Gmail address</label>
              <input className="input" type="email" value={s.smtpUser} onChange={(e) => updateSettings({ smtpUser: e.target.value })} placeholder="you@yourdomain.com" autoComplete="off" />
            </div>
            <div>
              <label className="label">App password</label>
              <input className="input mono" type="password" value={s.smtpAppPassword} onChange={(e) => updateSettings({ smtpAppPassword: e.target.value })} placeholder="16-char app password" autoComplete="off" />
            </div>
          </div>
        )}
      </section>

      {/* ── Data ── */}
      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[--color-text-dim]">
          <Database size={15} /> Data
        </h2>
        <p className="mb-4 text-sm text-[--color-text-dim]">
          All data lives in this browser (local-first). Download a backup regularly; restore moves your
          pipeline to any device.
        </p>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={downloadBackup}>
            <Download size={15} /> Download backup
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Restore backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restoreBackup(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <Toast msg={toast.msg} error={toast.error} />
    </div>
  );
}
