import type { WarningInterventionAppointment, WarningInterventionRecord } from "@/types/warning";
import { getInterventionNotificationPlan } from "@/lib/intervention-appointments";

type InterventionRecordsProps = {
  records: WarningInterventionRecord[];
  appointments: WarningInterventionAppointment[];
};

const appointmentStatusLabels: Record<WarningInterventionAppointment["status"], string> = {
  planned: "已预约",
  completed: "已完成",
  no_show: "未到场",
  cancelled: "已取消",
  rescheduled: "已改约",
};

function InterventionRecordItem({ record }: { record: WarningInterventionRecord }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-neutral-900">{record.method}</div>
        <div className="shrink-0 text-xs text-neutral-500">{record.occurredAt}</div>
      </div>
      <div className="mt-1 text-xs font-medium text-neutral-500">记录人：{record.authorName}</div>
      <dl className="mt-3 space-y-2 text-sm leading-6">
        <div>
          <dt className="font-semibold text-neutral-500">情况摘要</dt>
          <dd className="text-neutral-800">{record.summary}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">本次判断</dt>
          <dd className="text-neutral-800">{record.judgment}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">后续计划</dt>
          <dd className="text-neutral-800">{record.followUpPlan}</dd>
        </div>
      </dl>
    </div>
  );
}

export function InterventionRecords({ records, appointments }: InterventionRecordsProps) {
  const sortedRecords = [...records].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">干预预约与记录</h3>
        <span className="text-xs font-medium text-neutral-500">预约 {appointments.length} · 记录 {sortedRecords.length}</span>
      </div>

      <div className="mb-3 space-y-2">
        {[...appointments].sort((left, right) => right.plannedAt.localeCompare(left.plannedAt)).map((appointment) => (
          <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm" key={appointment.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-neutral-900">{appointment.plannedAt}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">{appointmentStatusLabels[appointment.status]}</span>
            </div>
            <div className="mt-2 grid gap-1 text-xs leading-5 text-neutral-600 sm:grid-cols-2">
              <span>地点：{appointment.location}</span>
              <span>负责：{appointment.responsibleTeacher}</span>
              <span>陪同：{appointment.escortTeacher || "-"}</span>
              <span>改约来源：{appointment.rescheduledFromId || "-"}</span>
              <span className="sm:col-span-2">通知计划：{getInterventionNotificationPlan(appointment).map((item) => `${item.label}（预计 ${item.expectedAt}）`).join("；")}</span>
            </div>
            {appointment.note ? <p className="mt-2 text-xs text-neutral-600">说明：{appointment.note}</p> : null}
            {appointment.cancellationReason ? <p className="mt-2 text-xs text-red-700">取消原因：{appointment.cancellationReason}</p> : null}
          </div>
        ))}
        {!appointments.length ? <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">暂无干预预约</div> : null}
      </div>

      {sortedRecords.length > 0 ? (
        <div className="space-y-2">
          {sortedRecords.map((record) => (
            <InterventionRecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          暂无干预记录
        </div>
      )}
    </section>
  );
}
