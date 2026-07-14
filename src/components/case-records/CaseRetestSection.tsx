import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseRetestSection({ detail }: { detail: StudentProfileCaseDetail }) {
  if (!detail.retestRecords.length) {
    return <CaseRecordEmptyState text="暂无复测记录" />;
  }

  return (
    <div className="space-y-2">
      {detail.retestRecords.map((record) => (
        <dl className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2" key={record.id}>
          <CaseRecordValue label="安排时间" value={record.arrangedAt} />
          <CaseRecordValue label="计划复测时间" value={record.plannedAt} />
          <CaseRecordValue label="实际完成时间" value={record.completedAt || "尚未完成复测"} />
          <CaseRecordValue label="复测量表" value={record.scaleNames.join("、")} />
          <CaseRecordValue label="结果摘要" value={record.completedAt ? record.resultSummary || "暂无结果摘要" : "尚未完成复测"} />
          <CaseRecordValue label="与上次结果对比" value={record.completedAt ? record.comparison : undefined} />
          <div className="sm:col-span-2"><CaseRecordValue label="补充说明" value={record.note} /></div>
        </dl>
      ))}
    </div>
  );
}
