import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseInterventionSection({ detail }: { detail: StudentProfileCaseDetail }) {
  if (!detail.interventionRecords.length) {
    return <CaseRecordEmptyState text="暂无干预记录" />;
  }

  return (
    <div className="space-y-2">
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
