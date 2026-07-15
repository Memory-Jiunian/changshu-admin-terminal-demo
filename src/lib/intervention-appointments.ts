import type { WarningInterventionAppointment } from "@/types/warning";

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
