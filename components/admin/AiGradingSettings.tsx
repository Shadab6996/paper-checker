"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { FREE_MODEL_OPTIONS, type AiProvider } from "@/lib/ai/types";

function findOptionId(provider: AiProvider, model: string | null): string {
  const match = FREE_MODEL_OPTIONS.find(
    (o) => o.provider === provider && o.model === (model || o.model)
  );
  return match?.id ?? FREE_MODEL_OPTIONS[0].id;
}

export function AiGradingSettings({
  initialProvider,
  initialModel,
}: {
  initialProvider: AiProvider;
  initialModel: string | null;
}) {
  const [optionId, setOptionId] = useState(findOptionId(initialProvider, initialModel));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(nextId: string) {
    setOptionId(nextId);
    const option = FREE_MODEL_OPTIONS.find((o) => o.id === nextId);
    if (!option) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/ai-grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: option.provider, model: option.model }),
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
          Which AI checks papers when you use &quot;Check papers with AI&quot;. Only free
          options are listed.
        </p>
      </div>

      <Field label="Model" htmlFor="aiModelOption">
        <select
          id="aiModelOption"
          value={optionId}
          onChange={(e) => handleSave(e.target.value)}
          disabled={saving}
          className="min-h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {FREE_MODEL_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {saving && <p className="text-sm text-muted-foreground">Saving…</p>}
      {saved && !saving && <p className="text-sm font-medium text-success">Saved.</p>}
    </Card>
  );
}
