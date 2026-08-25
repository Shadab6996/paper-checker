"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const SLOTS = 5;

export function HeroNamesSettings({ initialNames }: { initialNames: string[] }) {
  const padded = [...initialNames, "", "", "", "", ""].slice(0, SLOTS);
  const [names, setNames] = useState(padded);
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
        body: JSON.stringify({ heroNames: names.map((n) => n.trim()) }),
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
        <h2 className="text-sm font-semibold text-foreground">Names on the login page</h2>
        <p className="text-xs text-muted-foreground">
          Up to 5 names shown as decoration on the login page. Leave blank to hide.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {names.map((name, i) => (
          <Input
            key={i}
            value={name}
            onChange={(e) => setName(i, e.target.value)}
            placeholder={`Name ${i + 1}`}
            maxLength={40}
          />
        ))}
      </div>
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
