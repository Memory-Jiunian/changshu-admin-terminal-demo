import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEffectiveFeedbackStatus } from "@/lib/warning-feedback";
import {
  feedbackStatusLabels,
  type FeedbackStatus,
  type WarningFeedbackRecord,
  type WarningItem,
} from "@/types/warning";

type FeedbackPanelProps = {
  warning: WarningItem;
  currentTime: string;
  onPlaceholderAction: (label: string) => void;
};

const feedbackBadgeClass: Record<FeedbackStatus, string> = {
  not_requested: "border-neutral-200 bg-neutral-50 text-neutral-500",
  pending_feedback: "border-neutral-200 bg-neutral-100 text-neutral-700",
  feedback_received: "border-neutral-200 bg-white text-neutral-700",
  feedback_overdue: "border-neutral-900 bg-neutral-900 text-white",
  new_feedback: "border-neutral-300 bg-neutral-100 text-neutral-950",
};

function getEmptyFeedbackText(status: FeedbackStatus) {
  if (status === "pending_feedback") {
    return "已请求，暂未收到反馈";
  }

  if (status === "feedback_overdue") {
    return "反馈已超时，暂未收到班主任反馈";
  }

  return "暂无反馈";
}

function getSortedFeedbackRecords(records: WarningFeedbackRecord[]) {
  return [...records].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}

function FeedbackRecordItem({ record }: { record: WarningFeedbackRecord }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-neutral-900">
          {record.authorRole} · {record.authorName}
        </div>
        <div className="shrink-0 text-xs text-neutral-500">{record.submittedAt}</div>
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{record.content}</p>
    </div>
  );
}

export function FeedbackPanel({ warning, currentTime, onPlaceholderAction }: FeedbackPanelProps) {
  const effectiveFeedbackStatus = getEffectiveFeedbackStatus(warning, currentTime);
  const feedbackRecords = getSortedFeedbackRecords(warning.feedbackRecords);
  const hasFeedback = feedbackRecords.length > 0;
  const hasMultipleFeedback = feedbackRecords.length > 1;
  const linkLabel = hasMultipleFeedback ? "查看全部反馈" : "查看完整反馈";

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950">班主任反馈</h3>
        <Badge className={feedbackBadgeClass[effectiveFeedbackStatus]} variant="outline">
          {feedbackStatusLabels[effectiveFeedbackStatus]}
        </Badge>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        <span>班主任：{warning.headTeacherName}</span>
        <span>联系电话：{warning.headTeacherPhone}</span>
        <span className="col-span-2">反馈截止：{warning.feedbackDeadline || "-"}</span>
      </div>

      {hasFeedback ? (
        <div className="space-y-2">
          {feedbackRecords.map((record) => (
            <FeedbackRecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          {getEmptyFeedbackText(effectiveFeedbackStatus)}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {hasFeedback ? (
          <Button
            className="h-8 gap-1 px-0 font-semibold text-neutral-900"
            onClick={() => onPlaceholderAction(linkLabel)}
            type="button"
            variant="link"
          >
            {linkLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
