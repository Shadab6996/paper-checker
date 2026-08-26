"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteTestButton({
  testCode,
  testName,
  submissionCount,
}: {
  testCode: string;
  testName: string;
  submissionCount: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${testCode}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not delete test");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-9 cursor-pointer rounded-lg border border-destructive/30 px-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
      >
        Delete test
      </button>

      {confirming && (
        <Modal title="Delete test?" onClose={() => setConfirming(false)}>
          <p className="text-sm text-muted-foreground">
            This will permanently delete <strong>{testName}</strong>
            {submissionCount > 0 && (
              <>
                {" "}
                and its {submissionCount} submitted photo{submissionCount === 1 ? "" : "s"}
                {" "}(and any grades on them)
              </>
            )}
            , plus its question paper and answer key. This can&apos;t be undone.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
