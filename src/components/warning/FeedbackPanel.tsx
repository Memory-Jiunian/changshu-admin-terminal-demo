import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackCollaborationRounds } from "@/components/case-records/FeedbackCollaborationRounds";
import { getEffectiveFeedbackStatus, hasUnreadWarningFeedback } from "@/lib/warning-feedback";
import { buildWarningFeedbackCollaboration } from "@/lib/warning-records";
import {
  feedbackStatusLabels,
  type FeedbackStatus,
  type WarningItem,
} from "@/types/warning";

type FeedbackPanelProps = {
  warning: WarningItem;
  currentTime: string;
  onMarkFeedbackRead?: () => void;
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

export function FeedbackPanel({ warning, currentTime, onMarkFeedbackRead }: FeedbackPanelProps) {
  const effectiveFeedbackStatus = getEffectiveFeedbackStatus(warning, currentTime);
  const hasUnreadFeedback = hasUnreadWarningFeedback(warning);
  const collaboration = buildWarningFeedbackCollaboration(warning.feedbackRequests, warning.feedbackRecords);

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

      {warning.feedbackRequests.length || warning.feedbackRecords.length ? (
        <FeedbackCollaborationRounds collaboration={collaboration} />
      ) : (
        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          {getEmptyFeedbackText(effectiveFeedbackStatus)}
        </div>
      )}

      {hasUnreadFeedback && onMarkFeedbackRead ? (
        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-3">
          <Button onClick={onMarkFeedbackRead} size="sm" type="button">
            标记为已查看
          </Button>
        </div>
      ) : null}

    </section>
  );
}
