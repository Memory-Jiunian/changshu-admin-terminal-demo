import { getInterventionNotificationPlan } from "@/lib/intervention-appointments";
import type {
  WarningInterventionAppointment,
  WarningInterventionHistory,
  WarningInterventionRecord,
} from "@/types/warning";

const appointmentStatusLabels: Record<WarningInterventionAppointment["status"], string> = {
  planned: "已预约",
  completed: "已完成",
  no_show: "未到场",
  cancelled: "已取消",
  rescheduled: "已改约",
};

function Value({ label, value }: { label: string; value?: string }) {
  return <div><dt className="text-xs font-medium text-neutral-500">{label}</dt><dd className="mt-1 text-sm leading-6 text-neutral-800">{value || "-"}</dd></div>;
}

function InterventionResult({ record }: { record: WarningInterventionRecord }) {
  return <div className="mt-3 border-t border-neutral-200 pt-3">
    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">本轮干预结果</div>
    <dl className="grid gap-3 sm:grid-cols-2">
      <Value label="实际干预时间" value={record.occurredAt} />
      <Value label="记录人" value={record.authorName} />
      <Value label="干预方式" value={record.method} />
      <Value label="本次判断" value={record.judgment} />
      <div className="sm:col-span-2"><Value label="情况摘要" value={record.summary} /></div>
      <div className="sm:col-span-2"><Value label="下一步计划" value={record.followUpPlan} /></div>
    </dl>
  </div>;
}

function UnlinkedRecord({ record }: { record: WarningInterventionRecord }) {
  return <div className="rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-3">
    <InterventionResult record={record} />
  </div>;
}

export function InterventionHistoryView({ history }: { history: WarningInterventionHistory }) {
  if (!history.rounds.length && !history.unlinkedRecords.length) {
    return <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-500">暂无干预预约与记录</div>;
  }

  return <div className="space-y-3">
    {history.dataIssues.length ? <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{history.dataIssues.map((issue) => <div key={issue}>{issue}</div>)}</div> : null}
    {history.rounds.map(({ appointment, result, dataIssues }, index) => (
      <article className="rounded-md border border-neutral-200 bg-white p-3" key={appointment.id}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-neutral-950">干预轮次 {history.rounds.length - index}</div>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">{appointmentStatusLabels[appointment.status]}</span>
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Value label="计划干预时间" value={appointment.plannedAt} />
          <Value label="地点" value={appointment.location} />
          <Value label="负责心理老师" value={appointment.responsibleTeacher} />
          <Value label="陪同班主任" value={appointment.escortTeacher} />
          <Value label="创建时间" value={`${appointment.createdAt} · ${appointment.createdBy}`} />
          <Value label="预约状态" value={appointmentStatusLabels[appointment.status]} />
          <Value label="改约来源" value={appointment.rescheduledFromId} />
          <Value label="通知计划" value={getInterventionNotificationPlan(appointment).map((item) => `${item.label}（预计 ${item.expectedAt}）`).join("；")} />
          {appointment.cancellationReason ? <div className="sm:col-span-2"><Value label="取消原因" value={appointment.cancellationReason} /></div> : null}
          {appointment.note ? <div className="sm:col-span-2"><Value label="预约说明" value={appointment.note} /></div> : null}
        </dl>
        {dataIssues.map((issue) => <div className="mt-3 text-xs text-amber-800" key={issue}>{issue}</div>)}
        {result ? <InterventionResult record={result} /> : <div className="mt-3 border-t border-dashed border-neutral-200 pt-3 text-sm text-neutral-500">尚未记录本次干预结果</div>}
      </article>
    ))}
    {history.unlinkedRecords.length ? <section>
      <h4 className="mb-2 text-sm font-semibold text-amber-900">未关联历史记录</h4>
      <div className="space-y-2">{history.unlinkedRecords.map((record) => <UnlinkedRecord key={record.id} record={record} />)}</div>
    </section> : null}
  </div>;
}
