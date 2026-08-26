"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubmissionReviewModal } from "@/components/admin/SubmissionReviewModal";

export type GradeStatus = "ungraded" | "graded" | "approved" | "error";

export type SubmissionItem = {
  id: string;
  studentName: string;
  submittedAt: string;
  imageUrls: string[];
  gradeStatus: GradeStatus;
  aiScore: number | null;
  aiMaxScore: number | null;
  aiFeedback: {
    questions: { question: string; marksAwarded: number; marksPossible: number; feedback: string }[];
    overallFeedback: string;
  } | null;
  gradeError: string | null;
  finalScore: number | null;
  finalFeedback: string | null;
};

function StatusBadge({ item }: { item: SubmissionItem }) {
  if (item.gradeStatus === "approved") {
    return (
      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
        Approved: {item.finalScore}
        {item.aiMaxScore != null ? `/${item.aiMaxScore}` : ""}
      </span>
    );
  }
  if (item.gradeStatus === "graded") {
    return (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
        AI: {item.aiScore}/{item.aiMaxScore}
      </span>
    );
  }
  if (item.gradeStatus === "error") {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        Check failed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Not checked
    </span>
  );
}

export function SubmissionGallery({
  items: initialItems,
  hasAnswerKey,
}: {
  items: SubmissionItem[];
  hasAnswerKey: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.studentName.toLowerCase().includes(q));
  }, [items, query]);

  const active = items.find((i) => i.id === activeId) ?? null;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((i) => i.id)));
  }

  async function gradeOne(id: string) {
    setGradingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}/grade`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data.submission } : i)));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, gradeStatus: "error", gradeError: data.error } : i
          )
        );
      }
    } finally {
      setGradingId(null);
    }
  }

  async function approveOne(id: string, score: number, feedback: string) {
    const res = await fetch(`/api/submissions/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, feedback }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data.submission } : i)));
    }
  }

  async function checkSelected() {
    const ids = Array.from(selected);
    setBulkProgress({ done: 0, total: ids.length });
    for (let i = 0; i < ids.length; i++) {
      await gradeOne(ids[i]);
      setBulkProgress({ done: i + 1, total: ids.length });
    }
    setBulkProgress(null);
    setSelected(new Set());
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by student name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search submissions by student name"
          className="max-w-xs"
        />
        <Button variant="secondary" onClick={selectAllFiltered} disabled={filtered.length === 0}>
          Select all
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSelected(new Set())}
          disabled={selected.size === 0}
        >
          Clear
        </Button>
        <Button
          onClick={checkSelected}
          disabled={selected.size === 0 || !hasAnswerKey || bulkProgress !== null}
        >
          {bulkProgress
            ? `Checking ${bulkProgress.done}/${bulkProgress.total}…`
            : `Check papers with AI (${selected.size})`}
        </Button>
        {!hasAnswerKey && (
          <p className="text-xs text-muted-foreground">
            Upload an answer key on the test page first.
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {items.length === 0 ? "No submissions yet." : "No students match that search."}
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
            >
              <label className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-card/90">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelected(item.id)}
                  aria-label={`Select ${item.studentName}`}
                  className="h-4 w-4 cursor-pointer"
                />
              </label>
              <button type="button" onClick={() => setActiveId(item.id)} className="relative cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrls[0]}
                  alt={`Submission by ${item.studentName}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full bg-muted object-cover"
                />
                {item.imageUrls.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-semibold text-white">
                    {item.imageUrls.length} pages
                  </span>
                )}
                <div className="flex flex-col gap-1 p-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.submittedAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <StatusBadge item={item} />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <SubmissionReviewModal
          item={active}
          hasAnswerKey={hasAnswerKey}
          onClose={() => setActiveId(null)}
          onGrade={gradeOne}
          onApprove={approveOne}
          isGrading={gradingId === active.id}
        />
      )}
    </div>
  );
}
