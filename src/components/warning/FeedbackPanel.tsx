import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  feedbackStatusLabels,
  type FeedbackStatus,
  type WarningItem,
} from "@/types/warning";

type FeedbackPanelProps = {
  warning: WarningItem;
  onPlaceholderAction: (label: string) => void;
};

const feedbackBadgeClass: Record<FeedbackStatus, string> = {
  not_requested: "border-neutral-200 bg-neutral-50 text-neutral-500",
  pending_feedback: "border-neutral-200 bg-neutral-100 text-neutral-700",
  feedback_received: "border-neutral-200 bg-white text-neutral-700",
  feedback_overdue: "border-neutral-900 bg-neutral-900 text-white",
  new_feedback: "border-neutral-300 bg-neutral-100 text-neutral-950",
};

function getFeedbackSummary(warning: WarningItem) {
  if (warning.feedbackStatus === "not_requested") {
    return "暂无反馈";
  }

  return warning.teacherFeedbackSummary || "暂无反馈";
}

export function FeedbackPanel({ warning, onPlaceholderAction }: FeedbackPanelProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950">班主任反馈</h3>
        <Badge className={feedbackBadgeClass[warning.feedbackStatus]} variant="outline">
          {feedbackStatusLabels[warning.feedbackStatus]}
        </Badge>
      </div>

      <div>
        <div className="text-xs font-semibold text-neutral-500">反馈摘要</div>
        <p className="mt-1 text-sm leading-6 text-neutral-800">
          {getFeedbackSummary(warning)}
        </p>
      </div>

      <Button
        className="mt-3 h-8 gap-1 px-0 font-semibold text-neutral-900"
        onClick={() => onPlaceholderAction("查看完整反馈")}
        type="button"
        variant="link"
      >
        查看完整反馈
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    </section>
  );
}
