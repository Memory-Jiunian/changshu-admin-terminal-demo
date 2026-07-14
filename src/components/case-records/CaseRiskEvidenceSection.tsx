import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import { DeepAssessmentRecords } from "@/components/case-records/DeepAssessmentRecords";
import { AiConversationRecords } from "@/components/case-records/AiConversationRecords";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";
import { riskLevelLabels, warningEvidenceTypeLabels, warningSourceTypeLabels } from "@/types/warning";

export function CaseRiskEvidenceSection({ detail }: { detail: StudentProfileCaseDetail }) {
  const evidence = detail.riskEvidence;

  return (
    <div className="space-y-5">
    <dl className="grid gap-4 sm:grid-cols-2">
      <CaseRecordValue label="事项来源" value={warningSourceTypeLabels[evidence.sourceType]} />
      <CaseRecordValue label="风险依据类型" value={evidence.evidenceTypes.length ? evidence.evidenceTypes.map((type) => warningEvidenceTypeLabels[type]).join("、") : "暂无风险依据类型"} />
      <CaseRecordValue label="系统提示风险等级" value={riskLevelLabels[evidence.suggestedRiskLevel]} />
      <CaseRecordValue label="心理老师确认风险等级" value={evidence.confirmedRiskLevel ? riskLevelLabels[evidence.confirmedRiskLevel] : "待确认"} />
      <div className="sm:col-span-2"><CaseRecordValue label="风险等级调整理由" value={evidence.riskLevelAdjustmentReason} /></div>
      <div className="sm:col-span-2"><CaseRecordValue label="测评摘要" value={evidence.assessmentSummary || "暂无测评摘要"} /></div>
      <div className="sm:col-span-2"><CaseRecordValue label="AI 线索摘要" value={evidence.aiSummary || "暂无 AI 线索摘要"} /></div>
    </dl>
    <section><h4 className="mb-2 text-sm font-semibold text-neutral-900">完整深度测评记录</h4><DeepAssessmentRecords records={evidence.deepAssessmentRecords} /></section>
    <section><h4 className="mb-2 text-sm font-semibold text-neutral-900">AI 倾诉可见会话</h4><AiConversationRecords records={evidence.aiConversationRecords} /></section>
    </div>
  );
}
