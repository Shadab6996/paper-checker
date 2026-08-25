"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
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
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-base font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-9 min-w-9 cursor-pointer rounded-full text-lg font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
