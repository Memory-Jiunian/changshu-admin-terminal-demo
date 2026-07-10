import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  riskLevelLabels,
  warningEvidenceTypeLabels,
  warningSourceTypeLabels,
  type WarningItem,
} from "@/types/warning";

type RiskEvidenceProps = {
  warning: WarningItem;
  onPlaceholderAction: (label: string) => void;
};

export function RiskEvidence({ warning, onPlaceholderAction }: RiskEvidenceProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-neutral-950">风险依据</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-neutral-500">来源</div>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              {warningSourceTypeLabels[warning.sourceType]}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-500">系统提示风险等级</div>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              {riskLevelLabels[warning.suggestedRiskLevel]}
            </p>
          </div>
          <div className="col-span-2">
            <div className="text-xs font-semibold text-neutral-500">风险依据</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {warning.evidenceTypes.map((evidenceType) => (
                <Badge
                  className="border-neutral-200 bg-neutral-100 text-neutral-700"
                  key={evidenceType}
                  variant="outline"
                >
                  {warningEvidenceTypeLabels[evidenceType]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="col-span-2">
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

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            className="h-8 gap-1 px-0 font-semibold text-neutral-900"
            onClick={() => onPlaceholderAction("查看深度测评记录")}
            type="button"
            variant="link"
          >
            查看深度测评记录
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            className="h-8 gap-1 px-0 font-semibold text-neutral-900"
            onClick={() => onPlaceholderAction("查看 AI 倾诉记录")}
            type="button"
            variant="link"
          >
            查看 AI 倾诉记录
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
