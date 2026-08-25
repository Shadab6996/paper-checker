"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

const SLOTS = 5;

export function HeroNamesSettings({
  initialNames,
  initialQuote,
}: {
  initialNames: string[];
  initialQuote: string;
}) {
  const padded = [...initialNames, "", "", "", "", ""].slice(0, SLOTS);
  const [names, setNames] = useState(padded);
  const [quote, setQuote] = useState(initialQuote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/hero-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroNames: names.map((n) => n.trim()),
          heroQuote: quote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error, please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Login page hero</h2>
        <p className="text-xs text-muted-foreground">
          Controls what shows as decoration on the login page.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Names (up to 5, leave blank to hide)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {names.map((name, i) => (
            <Input
              key={i}
              value={name}
              onChange={(e) => {
                setName(i, e.target.value);
              }}
              placeholder={`Name ${i + 1}`}
              maxLength={40}
            />
          ))}
        </div>
      </div>

      <Field label="Quote" htmlFor="heroQuote" hint="Shown under the headline">
        <Input
          id="heroQuote"
          value={quote}
          onChange={(e) => {
            setQuote(e.target.value);
            setSaved(false);
          }}
          maxLength={160}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="w-fit">
          {saving ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-sm font-medium text-success">Saved</span>}
      </div>
    </Card>
  );
}
