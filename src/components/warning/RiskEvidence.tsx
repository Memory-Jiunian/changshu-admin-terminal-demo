import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clueTypeLabels, type WarningItem } from "@/types/warning";

type RiskEvidenceProps = {
  warning: WarningItem;
  onPlaceholderAction: (label: string) => void;
};

export function RiskEvidence({ warning, onPlaceholderAction }: RiskEvidenceProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950">风险依据</h3>
        <Badge className="border-neutral-300 bg-neutral-100 text-neutral-800" variant="outline">
          {clueTypeLabels[warning.clueType]}
        </Badge>
      </div>

      <div className="space-y-3">
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
