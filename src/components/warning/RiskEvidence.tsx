import { Badge } from "@/components/ui/badge";
import { DeepAssessmentRecords } from "@/components/case-records/DeepAssessmentRecords";
import { AiConversationRecords } from "@/components/case-records/AiConversationRecords";
import {
  getEffectiveRiskLevel,
  riskLevelLabels,
  type RiskLevel,
  type WarningItem,
} from "@/types/warning";

type RiskEvidenceProps = {
  warning: WarningItem;
};

const riskBadgeClass: Record<RiskLevel, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-neutral-200 bg-neutral-100 text-neutral-700",
  high: "border-neutral-300 bg-neutral-900 text-white",
  critical: "border-neutral-900 bg-white text-neutral-950",
};

export function RiskEvidence({ warning }: RiskEvidenceProps) {
  const effectiveRiskLevel = getEffectiveRiskLevel(warning);

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">风险依据</h3>
        <Badge className={riskBadgeClass[effectiveRiskLevel]} variant="outline">
          {riskLevelLabels[effectiveRiskLevel]}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-neutral-500">系统提示风险等级</div>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              {riskLevelLabels[warning.suggestedRiskLevel]}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-500">心理老师确认风险等级</div>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {warning.confirmedRiskLevel
                ? riskLevelLabels[warning.confirmedRiskLevel]
                : "待心理老师确认"}
            </p>
          </div>
          {warning.riskLevelAdjustmentReason ? (
            <div className="col-span-2 rounded-md bg-neutral-50 px-3 py-2">
              <div className="text-xs font-semibold text-neutral-500">风险等级调整理由</div>
              <p className="mt-1 text-sm leading-6 text-neutral-800">
                {warning.riskLevelAdjustmentReason}
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-xs font-semibold text-neutral-500">测评摘要</div>
          <p className="mt-1 text-sm leading-6 text-neutral-800">{warning.assessmentSummary}</p>
        </div>

        <div>
          <div className="text-xs font-semibold text-neutral-500">AI 线索摘要</div>
          <p className="mt-1 text-sm leading-6 text-neutral-800">{warning.aiSummary}</p>
        </div>

        <div><div className="mb-2 text-xs font-semibold text-neutral-500">完整深度测评记录</div><DeepAssessmentRecords records={warning.deepAssessmentRecords} /></div>
        <div><div className="mb-2 text-xs font-semibold text-neutral-500">AI 倾诉可见会话</div><AiConversationRecords records={warning.aiConversationRecords} /></div>
      </div>
    </section>
  );
}
