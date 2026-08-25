import type { TestStatus } from "@/lib/testStatus";

const styles: Record<TestStatus, string> = {
  live: "bg-success/10 text-success",
  upcoming: "bg-primary/10 text-primary",
  ended: "bg-muted text-muted-foreground",
};

const labels: Record<TestStatus, string> = {
  live: "Live",
  upcoming: "Upcoming",
  ended: "Ended",
};

export function StatusBadge({ status }: { status: TestStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
      )}
      {labels[status]}
    </span>
  );
}
