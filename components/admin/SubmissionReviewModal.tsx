"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SubmissionItem } from "@/components/admin/SubmissionGallery";

function feedbackToText(item: SubmissionItem): string {
  if (item.finalFeedback) return item.finalFeedback;
  if (!item.aiFeedback) return "";
  const lines = item.aiFeedback.questions.map(
    (q) => `${q.question}: ${q.marksAwarded}/${q.marksPossible} — ${q.feedback}`
  );
  return [...lines, "", `Overall: ${item.aiFeedback.overallFeedback}`].join("\n");
}

type Props = {
  item: SubmissionItem;
  hasAnswerKey: boolean;
  onClose: () => void;
  onGrade: (id: string) => Promise<void>;
  onApprove: (id: string, score: number, feedback: string) => Promise<void>;
  isGrading: boolean;
};

function GradeReview({
  item,
  onGrade,
  onApprove,
  isGrading,
}: Pick<Props, "item" | "onGrade" | "onApprove" | "isGrading">) {
  const [score, setScore] = useState(String(item.finalScore ?? item.aiScore ?? ""));
  const [feedback, setFeedback] = useState(feedbackToText(item));
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  if (!item.aiFeedback) return null;

  async function handleApprove() {
    const parsedScore = Number(score);
    if (Number.isNaN(parsedScore) || parsedScore < 0) {
      setApproveError("Enter a valid score");
      return;
    }
    if (!feedback.trim()) {
      setApproveError("Feedback can't be empty");
      return;
    }
    setApproveError(null);
    setApproving(true);
    try {
      await onApprove(item.id, parsedScore, feedback.trim());
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold text-foreground">
          AI suggested: {item.aiScore} / {item.aiMaxScore}
        </p>
        {item.gradeStatus === "approved" && (
          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
            Approved: {item.finalScore} / {item.aiMaxScore}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-semibold">Q</th>
              <th className="px-3 py-2 font-semibold">Marks</th>
              <th className="px-3 py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {item.aiFeedback.questions.map((q, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium text-foreground">{q.question}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {q.marksAwarded}/{q.marksPossible}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{q.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
          What to improve
        </p>
        <p className="text-sm text-foreground">{item.aiFeedback.overallFeedback}</p>
      </div>

      <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {item.gradeStatus === "approved" ? "Edit & re-approve" : "Approve grade"}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="finalScore" className="text-sm text-muted-foreground">
            Score
          </label>
          <input
            id="finalScore"
            type="number"
            min={0}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-24 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-muted-foreground">/ {item.aiMaxScore}</span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {approveError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {approveError}
          </p>
        )}
        <div className="flex gap-2">
          <Button disabled={approving} onClick={handleApprove}>
            {approving ? "Saving…" : item.gradeStatus === "approved" ? "Save changes" : "Approve"}
          </Button>
          <Button variant="secondary" disabled={isGrading} onClick={() => onGrade(item.id)}>
            {isGrading ? "Re-checking…" : "Re-check with AI"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ManualGradeForm({
  itemId,
  onApprove,
  initialScore = "",
  initialFeedback = "",
}: {
  itemId: string;
  onApprove: (id: string, score: number, feedback: string) => Promise<void>;
  initialScore?: string;
  initialFeedback?: string;
}) {
  const [score, setScore] = useState(initialScore);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsedScore = Number(score);
    if (score.trim() === "" || Number.isNaN(parsedScore) || parsedScore < 0) {
      setError("Enter a valid score");
      return;
    }
    if (!feedback.trim()) {
      setError("Feedback can't be empty");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onApprove(itemId, parsedScore, feedback.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="manualScore" className="text-sm text-muted-foreground">
          Score
        </label>
        <input
          id="manualScore"
          type="number"
          min={0}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-24 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Feedback for the student…"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button disabled={saving} onClick={handleSave}>
        {saving ? "Saving…" : "Save grade"}
      </Button>
    </div>
  );
}

export function SubmissionReviewModal({
  item,
  hasAnswerKey,
  onClose,
  onGrade,
  onApprove,
  isGrading,
}: Props) {
  const [manual, setManual] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Review submission by ${item.studentName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl bg-card sm:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 z-10 min-h-11 min-w-11 cursor-pointer rounded-full bg-card/90 text-lg font-bold text-foreground hover:bg-muted"
        >
          ×
        </button>

        <div className="relative flex max-h-[40vh] shrink-0 flex-col items-center justify-center gap-2 bg-muted sm:max-h-[85vh] sm:w-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrls[page]}
            alt={`Page ${page + 1} of submission by ${item.studentName}`}
            className="max-h-[36vh] max-w-full object-contain sm:max-h-[80vh]"
          />
          {item.imageUrls.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="min-h-8 min-w-8 cursor-pointer rounded-full bg-card px-2 text-sm font-bold text-foreground shadow disabled:opacity-40"
              >
                ‹
              </button>
              <span className="text-xs font-medium text-muted-foreground">
                Page {page + 1} of {item.imageUrls.length}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(item.imageUrls.length - 1, p + 1))}
                disabled={page === item.imageUrls.length - 1}
                className="min-h-8 min-w-8 cursor-pointer rounded-full bg-card px-2 text-sm font-bold text-foreground shadow disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="flex max-h-[85vh] flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div>
            <p className="font-semibold text-foreground">{item.studentName}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.submittedAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          {item.gradeStatus === "ungraded" && (
            <div className="flex flex-col items-start gap-2 rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">
                {hasAnswerKey
                  ? "Not checked yet."
                  : "Upload an answer key for this test before checking papers."}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={!hasAnswerKey || isGrading}
                  onClick={() => onGrade(item.id)}
                >
                  {isGrading ? "Checking…" : "Check this paper"}
                </Button>
                <Button variant="secondary" onClick={() => setManual((v) => !v)}>
                  {manual ? "Cancel" : "Grade manually"}
                </Button>
              </div>
              {manual && <ManualGradeForm itemId={item.id} onApprove={onApprove} />}
            </div>
          )}

          {item.gradeStatus === "error" && (
            <div className="flex flex-col items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Couldn&apos;t check this paper</p>
              <p className="text-xs text-muted-foreground">{item.gradeError}</p>
              <div className="flex gap-2">
                <Button disabled={isGrading} onClick={() => onGrade(item.id)}>
                  {isGrading ? "Retrying…" : "Retry"}
                </Button>
                <Button variant="secondary" onClick={() => setManual((v) => !v)}>
                  {manual ? "Cancel" : "Grade manually"}
                </Button>
              </div>
              {manual && <ManualGradeForm itemId={item.id} onApprove={onApprove} />}
            </div>
          )}

          {(item.gradeStatus === "graded" || item.gradeStatus === "approved") &&
            item.aiFeedback && (
              <GradeReview
                key={`${item.gradeStatus}-${item.aiScore}-${item.finalScore}`}
                item={item}
                onGrade={onGrade}
                onApprove={onApprove}
                isGrading={isGrading}
              />
            )}

          {item.gradeStatus === "approved" && !item.aiFeedback && (
            <div className="flex flex-col gap-3">
              <p className="text-lg font-bold text-foreground">
                Grade: {item.finalScore}
                {!manual && (
                  <button
                    type="button"
                    onClick={() => setManual(true)}
                    className="ml-3 cursor-pointer text-sm font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </p>
              <p className="text-sm text-foreground">{item.finalFeedback}</p>
              {manual && (
                <ManualGradeForm
                  key={item.finalScore}
                  itemId={item.id}
                  onApprove={onApprove}
                  initialScore={String(item.finalScore ?? "")}
                  initialFeedback={item.finalFeedback ?? ""}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
