import type {
  WarningInterventionAppointment,
  WarningInterventionHistory,
  WarningInterventionRecord,
} from "@/types/warning";

type BuildWarningInterventionHistoryInput = {
  appointments: WarningInterventionAppointment[];
  records: WarningInterventionRecord[];
};

export function buildWarningInterventionHistory({
  appointments,
  records,
}: BuildWarningInterventionHistoryInput): WarningInterventionHistory {
  const appointmentsById = new Map(appointments.map((appointment) => [appointment.id, appointment]));
  const recordsByAppointment = new Map<string, WarningInterventionRecord[]>();
  const unlinkedRecords: WarningInterventionRecord[] = [];
  const dataIssues: string[] = [];

  for (const record of records) {
    if (!record.appointmentId || !appointmentsById.has(record.appointmentId)) {
      unlinkedRecords.push(record);
      dataIssues.push(
        record.appointmentId
          ? `干预记录 ${record.id} 关联的预约 ${record.appointmentId} 不存在。`
          : `干预记录 ${record.id} 缺少 appointmentId。`,
      );
      continue;
    }

    const linked = recordsByAppointment.get(record.appointmentId) ?? [];
    linked.push(record);
    recordsByAppointment.set(record.appointmentId, linked);
  }

  const rounds = [...appointments]
    .sort((left, right) =>
      (right.plannedAt || right.createdAt).localeCompare(left.plannedAt || left.createdAt),
    )
    .map((appointment) => {
      const linked = [...(recordsByAppointment.get(appointment.id) ?? [])]
        .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
      const roundIssues: string[] = [];

      if (linked.length > 1) {
        const message = `预约 ${appointment.id} 关联了 ${linked.length} 条正式干预结果，仅最新一条作为本轮结果，其余保留在未关联历史记录。`;
        roundIssues.push(message);
        dataIssues.push(message);
        unlinkedRecords.push(...linked.slice(1));
      }

      return {
        appointment,
        result: linked[0],
        dataIssues: roundIssues,
      };
    });

  return {
    rounds,
    unlinkedRecords: unlinkedRecords.sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt),
    ),
    dataIssues,
  };
}
