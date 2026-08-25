"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/Button";

type Kind = "questionPaper" | "answerKey";

const LABELS: Record<Kind, string> = {
  questionPaper: "Question paper",
  answerKey: "Answer key",
};

function extFromType(type: string): string {
  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  return "jpg";
}

export function TestDocuments({
  testCode,
  initialQuestionPaperPath,
  initialAnswerKeyPath,
}: {
  testCode: string;
  initialQuestionPaperPath: string | null;
  initialAnswerKeyPath: string | null;
}) {
  const [paths, setPaths] = useState<Record<Kind, string | null>>({
    questionPaper: initialQuestionPaperPath,
    answerKey: initialAnswerKeyPath,
  });
  const [busy, setBusy] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = {
    questionPaper: useRef<HTMLInputElement>(null),
    answerKey: useRef<HTMLInputElement>(null),
  };

  async function handleFile(kind: Kind, file: File) {
    setError(null);
    setBusy(kind);
    try {
      const pathname = `documents/${testCode}/${kind}.${extFromType(file.type)}`;
      const uploaded = await upload(pathname, file, {
        access: "private",
        handleUploadUrl: `/api/tests/${testCode}/documents/upload-url`,
        clientPayload: JSON.stringify({ kind }),
        contentType: file.type,
      });

      const res = await fetch(`/api/tests/${testCode}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, storagePath: uploaded.pathname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save document");

      setPaths((prev) => ({ ...prev, [kind]: uploaded.pathname }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(["questionPaper", "answerKey"] as Kind[]).map((kind) => (
        <div
          key={kind}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">{LABELS[kind]}</p>
            <p className="text-xs text-muted-foreground">
              {paths[kind] ? "Uploaded" : "Not uploaded yet"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {paths[kind] && (
              <a
                href={`/api/blob-image?pathname=${encodeURIComponent(paths[kind]!)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-9 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                View
              </a>
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={busy === kind}
              onClick={() => inputRefs[kind].current?.click()}
            >
              {busy === kind ? "Uploading…" : paths[kind] ? "Replace" : "Upload"}
            </Button>
            <input
              ref={inputRefs[kind]}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(kind, file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
