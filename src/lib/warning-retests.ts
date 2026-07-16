import type { WarningItem, WarningRetestRecord } from "@/types/warning";

export const RETEST_COMPLETION_GRACE_MINUTES = 120;

function parseDateTime(value: string) {
  const normalized = value.replace("T", " ");
  const [datePart, timePart] = normalized.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function addMinutes(value: string, minutes: number) {
  const date = parseDateTime(value);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getLatestPlannedRetest(warning: WarningItem): WarningRetestRecord | undefined {
  return [...warning.retestRecords]
    .filter((record) => !record.completedAt)
    .sort((left, right) => right.arrangedAt.localeCompare(left.arrangedAt))[0];
}

export function getLatestCompletedRetest(warning: WarningItem): WarningRetestRecord | undefined {
  return [...warning.retestRecords]
    .filter((record): record is WarningRetestRecord & { completedAt: string } => Boolean(record.completedAt))
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0];
}

export function isRetestIncompleteAfterGrace(record: WarningRetestRecord, currentTime: string) {
  return !record.completedAt && currentTime > addMinutes(record.plannedAt, RETEST_COMPLETION_GRACE_MINUTES);
}
