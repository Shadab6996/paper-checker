"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/formatDate";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function EditTestTiming({
  testCode,
  initialStartTime,
  initialEndTime,
}: {
  testCode: string;
  initialStartTime: string;
  initialEndTime: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState(() => toLocalInputValue(new Date(initialStartTime)));
  const [endTime, setEndTime] = useState(() => toLocalInputValue(new Date(initialEndTime)));
  const [startLabel, setStartLabel] = useState(initialStartTime);
  const [endLabel, setEndLabel] = useState(initialEndTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${testCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update timing");
        return;
      }
      setStartLabel(data.test.startTime);
      setEndLabel(data.test.endTime);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">
        Opens {formatDateTime(new Date(startLabel))}
        {" · "}
        Closes {formatDateTime(new Date(endLabel))}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ml-2 cursor-pointer font-semibold text-primary hover:underline"
        >
          Change
        </button>
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Opens at" htmlFor="editStartTime">
          <Input
            id="editStartTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Field>
        <Field label="Closes at" htmlFor="editEndTime">
          <Input
            id="editEndTime"
            type="datetime-local"
            value={endTime}
            min={startTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" disabled={saving} onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
