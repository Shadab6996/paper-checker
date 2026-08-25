"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";

export function TestForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          chapterName: chapterName.trim(),
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
