"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/imageCompression";

export type CapturedPhoto = { id: string; blob: Blob; previewUrl: string };

type Props = {
  onPhotosChange: (photos: CapturedPhoto[]) => void;
  maxPhotos?: number;
};

export function FileCaptureInput({ onPhotosChange, maxPhotos = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setProcessing(true);
    try {
      const remaining = maxPhotos - photos.length;
      const toProcess = files.slice(0, Math.max(0, remaining));
      const newPhotos: CapturedPhoto[] = [];
      for (const file of toProcess) {
        const blob = await compressImage(file);
        newPhotos.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          blob,
          previewUrl: URL.createObjectURL(blob),
        });
      }
      setPhotos((prev) => {
        const next = [...prev, ...newPhotos];
        onPhotosChange(next);
        return next;
      });
      if (files.length > toProcess.length) {
        setError(`Only added ${toProcess.length} — max ${maxPhotos} photos per submission.`);
      }
    } catch {
      setError("Couldn't read one of those photos — try again.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((p) => p.id !== id);
      onPhotosChange(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`Page ${i + 1} of your answer sheet`}
                className="aspect-[3/4] w-full rounded-xl border border-border bg-muted object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                aria-label={`Remove page ${i + 1}`}
                className="absolute -right-2 -top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-destructive text-sm font-bold text-white shadow"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing || photos.length >= maxPhotos}
        className="flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/50 px-4 py-6 text-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          width="28"
          height="28"
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
          {processing
            ? "Processing…"
            : photos.length > 0
              ? "Add another page"
              : "Take or choose photos"}
        </span>
        <span className="text-xs text-muted-foreground">
          {photos.length > 0
            ? `${photos.length} of ${maxPhotos} pages added`
            : "Camera or gallery — add one photo per page"}
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
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
