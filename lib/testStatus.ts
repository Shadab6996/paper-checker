export type TestStatus = "upcoming" | "live" | "ended";

export function getTestStatus(startTime: Date, endTime: Date, now = new Date()): TestStatus {
  if (now < startTime) return "upcoming";
  if (now > endTime) return "ended";
  return "live";
}
