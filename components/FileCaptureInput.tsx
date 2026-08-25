"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/imageCompression";

type Props = {
  onFileReady: (blob: Blob | null) => void;
};

export function FileCaptureInput({ onFileReady }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const blob = await compressImage(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      onFileReady(blob);
    } catch {
      setError("Couldn't read that photo — try again.");
      onFileReady(null);
    } finally {
      setProcessing(false);
    }
  }

  function handleRemove() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onFileReady(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (previewUrl) {
    return (
      <div className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Preview of your answer sheet photo"
          className="max-h-96 w-full rounded-2xl border border-border object-contain bg-muted"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="min-h-11 flex-1 cursor-pointer rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Retake / choose another
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="min-h-11 cursor-pointer rounded-xl border border-border bg-card px-4 text-sm font-semibold text-destructive hover:bg-muted"
          >
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/50 px-4 py-8 text-center transition-colors hover:bg-muted disabled:cursor-not-allowed"
      >
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M4 8a2 2 0 0 1 2-2h1.2a2 2 0 0 0 1.664-.89l.272-.41A2 2 0 0 1 10.8 4h2.4a2 2 0 0 1 1.664.89l.272.41A2 2 0 0 0 16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <circle cx="12" cy="12.5" r="3.5" />
        </svg>
        <span className="text-sm font-semibold text-foreground">
          {processing ? "Processing…" : "Take or upload a photo"}
        </span>
        <span className="text-xs text-muted-foreground">
          Make sure your answers are clear and well-lit
        </span>
      </button>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
