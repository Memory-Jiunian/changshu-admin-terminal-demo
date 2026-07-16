import type { WarningInterventionAppointment } from "@/types/warning";

export const INTERVENTION_CONFIRMATION_GRACE_MINUTES = 60;

export type InterventionAppointmentTiming =
  | "upcoming"
  | "awaiting_result"
  | "confirmation_required";

function parseDateTime(value: string) {
  const [datePart, timePart] = value.replace("T", " ").split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function addMinutes(value: string, minutes: number) {
  return formatDateTime(new Date(parseDateTime(value).getTime() + minutes * 60_000));
}

export function getInterventionAppointmentTiming(
  appointment: WarningInterventionAppointment,
  currentTime: string,
): InterventionAppointmentTiming {
  if (currentTime <= appointment.plannedAt) return "upcoming";
  return currentTime <= addMinutes(appointment.plannedAt, INTERVENTION_CONFIRMATION_GRACE_MINUTES)
    ? "awaiting_result"
    : "confirmation_required";
}

export function getLatestPlannedInterventionAppointment(
  appointments: WarningInterventionAppointment[],
) {
  return [...appointments]
    .filter((appointment) => appointment.status === "planned")
    .sort((left, right) => right.plannedAt.localeCompare(left.plannedAt))[0];
}

export function getInterventionNotificationPlan(
  appointment: WarningInterventionAppointment,
) {
  const plannedAt = parseDateTime(appointment.plannedAt);
  return appointment.notificationOffsetsMinutes.map((offsetMinutes) => {
    const expectedAt = new Date(plannedAt.getTime() - offsetMinutes * 60_000);
    return {
      offsetMinutes,
      expectedAt: formatDateTime(expectedAt),
      label: offsetMinutes === 1440 ? "提前 24 小时" : `提前 ${offsetMinutes} 分钟`,
    };
  });
}
