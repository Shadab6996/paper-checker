"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const defaultStart = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
const defaultEnd = new Date(defaultStart.getTime() + 24 * 60 * 60 * 1000); // +1 day

export function TestForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [startTime, setStartTime] = useState(toLocalInputValue(defaultStart));
  const [endTime, setEndTime] = useState(toLocalInputValue(defaultEnd));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          chapterName: chapterName.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/admin/tests/${data.test.code}`);
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field label="Test name" htmlFor="name" required hint="e.g. Unit Test 3">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>

      <Field label="Subject" htmlFor="subject" required hint="e.g. Mathematics">
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </Field>

      <Field
        label="Chapter"
        htmlFor="chapterName"
        required
        hint="Each test link covers one chapter — students won't need to pick it"
      >
        <Input
          id="chapterName"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Opens at" htmlFor="startTime" required>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </Field>

        <Field label="Closes at" htmlFor="endTime" required>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            min={startTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating…" : "Create test & get link"}
      </Button>
    </form>
  );
}
