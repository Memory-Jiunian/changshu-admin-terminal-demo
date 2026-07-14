import type { FeedbackStatus, WarningItem } from "@/types/warning";

export type FeedbackActionAvailability =
  | { kind: "request"; label: "请求补充反馈"; disabled: false; message: "" }
  | { kind: "waiting"; label: "等待反馈"; disabled: true; message: string }
  | { kind: "rerequest"; label: "重新请求反馈"; disabled: false; message: "" }
  | { kind: "hidden"; label: "请求补充反馈"; disabled: true; message: "" };

export function getEffectiveFeedbackStatus(
  warning: WarningItem,
  currentTime: string,
): FeedbackStatus {
  if (warning.feedbackRecords.length > 0) {
    return warning.hasUnreadFeedback ? "new_feedback" : "feedback_received";
  }

  if (!warning.feedbackDeadline) {
    return "not_requested";
  }

  return currentTime > warning.feedbackDeadline ? "feedback_overdue" : "pending_feedback";
}

export function getFeedbackActionAvailability(
  warning: WarningItem,
  currentTime: string,
): FeedbackActionAvailability {
  if (warning.currentStatus !== "formal_warning" || warning.feedbackRecords.length > 0) {
    return { kind: "hidden", label: "请求补充反馈", disabled: true, message: "" };
  }

  const status = getEffectiveFeedbackStatus(warning, currentTime);
  if (status === "pending_feedback") {
    return {
      kind: "waiting",
      label: "等待反馈",
      disabled: true,
      message: `当前反馈任务正在进行中，请等待班主任在 ${warning.feedbackDeadline} 前提交反馈。`,
    };
  }
  if (status === "feedback_overdue") {
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  return { kind: "request", label: "请求补充反馈", disabled: false, message: "" };
}
