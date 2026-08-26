const TIME_ZONE = "Asia/Kolkata";

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { timeZone: TIME_ZONE });
}
