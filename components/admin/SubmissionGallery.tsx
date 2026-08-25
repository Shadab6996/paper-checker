"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ImageLightbox } from "@/components/admin/ImageLightbox";

export type SubmissionItem = {
  id: string;
  studentName: string;
  submittedAt: string;
  imageUrl: string;
};

export function SubmissionGallery({ items }: { items: SubmissionItem[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<SubmissionItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.studentName.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="flex flex-col gap-5">
      <Input
        placeholder="Search by student name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search submissions by student name"
        className="max-w-xs"
      />

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {items.length === 0 ? "No submissions yet." : "No students match that search."}
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={`Submission by ${item.studentName}`}
                loading="lazy"
                className="aspect-[3/4] w-full bg-muted object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.studentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.submittedAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <ImageLightbox
          src={active.imageUrl}
          alt={`Submission by ${active.studentName}`}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
