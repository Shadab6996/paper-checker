"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileCaptureInput, type CapturedPhoto } from "@/components/FileCaptureInput";
import { Button } from "@/components/ui/Button";

type Props = { testCode: string };
type Status = "idle" | "uploading" | "done";

export function SubmitTestForm({ testCode }: Props) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  async function handleTurnIn() {
    if (photos.length === 0) return;
    setError(null);
    setStatus("uploading");
    try {
      const storagePaths: string[] = [];
      for (const [i, photo] of photos.entries()) {
        const uploaded = await upload(`${testCode}/${Date.now()}-${i}.jpg`, photo.blob, {
          access: "private",
          handleUploadUrl: "/api/submissions/upload-url",
          clientPayload: JSON.stringify({ testCode }),
          contentType: "image/jpeg",
        });
        storagePaths.push(uploaded.pathname);
      }

      const submitRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCode, storagePaths }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error ?? "Could not save submission");

      setSubmittedAt(new Date());
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  if (status === "done" && submittedAt) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-6 py-10 text-center">
        <svg
          aria-hidden="true"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 3 3 5-6" />
        </svg>
        <div>
          <p className="font-semibold text-foreground">Turned in</p>
          <p className="text-sm text-muted-foreground">
            Submitted {photos.length} photo{photos.length === 1 ? "" : "s"} at{" "}
            {submittedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Your work</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Add one photo per page. Once you turn in, you can&apos;t submit again for this test —
          make sure every page is included.
        </p>
        <FileCaptureInput onPhotosChange={setPhotos} />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleTurnIn}
        disabled={photos.length === 0 || status === "uploading"}
        className="w-full"
      >
        {status === "uploading"
          ? "Turning in…"
          : `Turn in${photos.length > 0 ? ` (${photos.length} photo${photos.length === 1 ? "" : "s"})` : ""}`}
      </Button>
    </div>
  );
}
