"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select the text manually
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 truncate rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground">
        {link}
      </code>
      <Button type="button" onClick={handleCopy} variant="secondary" className="shrink-0">
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
