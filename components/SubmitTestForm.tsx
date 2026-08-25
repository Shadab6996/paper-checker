"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileCaptureInput } from "@/components/FileCaptureInput";
import { Button } from "@/components/ui/Button";

type Props = { testCode: string };
type Status = "idle" | "uploading" | "done";

export function SubmitTestForm({ testCode }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  async function handleTurnIn() {
    if (!blob) return;
    setError(null);
    setStatus("uploading");
    try {
      const uploaded = await upload(`${testCode}/${Date.now()}.jpg`, blob, {
        access: "private",
        handleUploadUrl: "/api/submissions/upload-url",
        clientPayload: JSON.stringify({ testCode }),
        contentType: "image/jpeg",
      });

      const submitRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCode, storagePath: uploaded.pathname }),
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

  function handleSubmitAnother() {
    setBlob(null);
    setStatus("idle");
    setSubmittedAt(null);
    setError(null);
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
            Submitted at{" "}
            {submittedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmitAnother}
          className="mt-2 min-h-11 cursor-pointer text-sm font-semibold text-primary hover:underline"
        >
          Submit another photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Your work</h2>
        <FileCaptureInput onFileReady={setBlob} />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleTurnIn}
        disabled={!blob || status === "uploading"}
        className="w-full"
      >
        {status === "uploading" ? "Turning in…" : "Turn in"}
      </Button>
    </div>
  );
}
