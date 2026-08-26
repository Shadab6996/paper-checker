"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { AI_PROVIDERS, PROVIDER_LABELS, DEFAULT_MODELS, type AiProvider } from "@/lib/ai/types";

export function AiGradingSettings({
  initialProvider,
  initialModel,
}: {
  initialProvider: AiProvider;
  initialModel: string | null;
}) {
  const [provider, setProvider] = useState<AiProvider>(initialProvider);
  const [model, setModel] = useState(initialModel ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/ai-grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model: model.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">AI grading model</h2>
        <p className="text-xs text-muted-foreground">
          Which AI checks papers when you use &quot;Check papers with AI&quot;. Only Gemini has
          a free key configured by default — Claude and Grok need their own API key added
          (ask to have one wired in once you have it).
        </p>
      </div>

      <Field label="Provider" htmlFor="aiProvider">
        <select
          id="aiProvider"
          value={provider}
          onChange={(e) => {
            const next = e.target.value as AiProvider;
            setProvider(next);
            setSaved(false);
          }}
          className="min-h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {AI_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {PROVIDER_LABELS[p]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Model"
        htmlFor="aiModel"
        hint={`Leave blank to use the default (${DEFAULT_MODELS[provider]})`}
      >
        <Input
          id="aiModel"
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setSaved(false);
          }}
          placeholder={DEFAULT_MODELS[provider]}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {saved && <p className="text-sm font-medium text-success">Saved.</p>}

      <Button onClick={handleSave} disabled={saving} className="self-start">
        {saving ? "Saving…" : "Save"}
      </Button>
    </Card>
  );
}
