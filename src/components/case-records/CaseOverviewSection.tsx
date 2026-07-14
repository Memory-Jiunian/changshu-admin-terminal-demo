import { Badge } from "@/components/ui/badge";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";
import { riskLevelLabels, statusLabels, warningSourceTypeLabels } from "@/types/warning";

export type CaseRecordIdentity = {
  studentName: string;
  studentIdentifier: string;
  gradeClass: string;
};

export function CaseOverviewSection({ detail, identity }: { detail: StudentProfileCaseDetail; identity: CaseRecordIdentity }) {
  const { summary } = detail;
  const resultLabel = summary.outcome === "active"
    ? statusLabels[summary.currentStatus]
    : summary.outcome === "closed"
      ? "已闭环"
      : "未形成正式预警";

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Badge variant="outline">{resultLabel}</Badge></div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <CaseRecordValue label="学生姓名" value={identity.studentName} />
        <CaseRecordValue label="学号 / 学生编号" value={identity.studentIdentifier} />
        <CaseRecordValue label="年级 / 班级" value={identity.gradeClass} />
        <CaseRecordValue label="事项编号" value={summary.warningId} />
        <CaseRecordValue label="事项来源" value={warningSourceTypeLabels[summary.sourceType]} />
        <CaseRecordValue label="事项开始时间" value={summary.startedAt} />
        <CaseRecordValue label="事项结束 / 闭环时间" value={summary.endedAt} />
        <CaseRecordValue label="当前状态 / 最终结果" value={resultLabel} />
        <CaseRecordValue label="系统提示风险等级" value={riskLevelLabels[summary.suggestedRiskLevel]} />
        <CaseRecordValue label="心理老师确认风险等级" value={summary.confirmedRiskLevel ? riskLevelLabels[summary.confirmedRiskLevel] : "待确认"} />
        <CaseRecordValue label="当前有效风险等级" value={riskLevelLabels[summary.riskLevel]} />
        <CaseRecordValue label="负责心理老师" value={summary.responsibleTeacher} />
        <div className="sm:col-span-2"><CaseRecordValue label="风险等级调整理由" value={summary.riskLevelAdjustmentReason} /></div>
        <CaseRecordValue label="最近动态时间" value={summary.activityTime} />
        <div className="sm:col-span-2"><CaseRecordValue label="最近动态" value={summary.latestActivity} /></div>
      </dl>
    </div>
  );
}
