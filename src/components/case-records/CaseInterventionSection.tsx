import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";
import { getInterventionNotificationPlan } from "@/lib/intervention-appointments";

export function CaseInterventionSection({ detail }: { detail: StudentProfileCaseDetail }) {
  if (!detail.interventionRecords.length && !detail.interventionAppointments.length) {
    return <CaseRecordEmptyState text="暂无干预记录" />;
  }

  return (
    <div className="space-y-2">
      {detail.interventionAppointments.map((appointment) => (
        <dl className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3 sm:grid-cols-2" key={appointment.id}>
          <CaseRecordValue label="预约时间" value={appointment.plannedAt} />
          <CaseRecordValue label="预约状态" value={{ planned: "已预约", completed: "已完成", no_show: "未到场", cancelled: "已取消", rescheduled: "已改约" }[appointment.status]} />
          <CaseRecordValue label="地点" value={appointment.location} />
          <CaseRecordValue label="负责心理老师" value={appointment.responsibleTeacher} />
          <CaseRecordValue label="陪同老师" value={appointment.escortTeacher || "-"} />
          <CaseRecordValue label="改约来源" value={appointment.rescheduledFromId || "-"} />
          <CaseRecordValue label="通知计划" value={getInterventionNotificationPlan(appointment).map((item) => `${item.label}：${item.expectedAt}`).join("；")} />
          {appointment.cancellationReason ? <CaseRecordValue label="取消原因" value={appointment.cancellationReason} /> : null}
        </dl>
      ))}
      {detail.interventionRecords.map((record) => (
        <dl className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2" key={record.id}>
          <CaseRecordValue label="干预时间" value={record.occurredAt} />
          <CaseRecordValue label="记录人" value={record.authorName} />
          <CaseRecordValue label="干预方式" value={record.method} />
          <CaseRecordValue label="情况摘要" value={record.summary} />
          <CaseRecordValue label="本次判断" value={record.judgment} />
          <CaseRecordValue label="后续计划" value={record.followUpPlan} />
        </dl>
      ))}
    </div>
  );
}
