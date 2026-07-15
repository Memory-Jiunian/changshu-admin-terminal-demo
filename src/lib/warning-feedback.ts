import type { FeedbackStatus, WarningItem } from "@/types/warning";

export type FeedbackActionAvailability =
  | { kind: "request"; label: "请求补充反馈"; disabled: false; message: "" }
  | { kind: "waiting"; label: "等待反馈"; disabled: true; message: string }
  | { kind: "rerequest"; label: "重新请求反馈"; disabled: false; message: "" }
  | { kind: "hidden"; label: "请求补充反馈"; disabled: true; message: "" };

export function hasUnreadWarningFeedback(warning: WarningItem) {
  if (!warning.feedbackRecords.length) return false;

  const hasRecordLevelReadState = warning.feedbackRecords.some(
    (record) => record.psychologistReadAt !== undefined,
  );
  return hasRecordLevelReadState
    ? warning.feedbackRecords.some((record) => !record.psychologistReadAt)
    : warning.hasUnreadFeedback;
}

export function markWarningFeedbackRead({
  warning,
  feedbackRecordIds,
  readAt,
}: {
  warning: WarningItem;
  feedbackRecordIds?: string[];
  readAt: string;
}): WarningItem {
  const targetIds = new Set(
    feedbackRecordIds ?? warning.feedbackRecords
      .filter((record) => !record.psychologistReadAt)
      .map((record) => record.id),
  );
  const feedbackRecords = warning.feedbackRecords.map((record) =>
    targetIds.has(record.id) && !record.psychologistReadAt
      ? { ...record, psychologistReadAt: readAt }
      : record,
  );
  const hasUnreadFeedback = feedbackRecords.some((record) => !record.psychologistReadAt);

  return {
    ...warning,
    feedbackRecords,
    hasUnreadFeedback,
    feedbackStatus: hasUnreadFeedback ? "new_feedback" : "feedback_received",
  };
}

export function getEffectiveFeedbackStatus(
  warning: WarningItem,
  currentTime: string,
): FeedbackStatus {
  if (hasUnreadWarningFeedback(warning)) return "new_feedback";

  const activeRequest = [...warning.feedbackRequests]
    .filter((request) => request.status === "pending")
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (activeRequest) {
    return currentTime > activeRequest.deadline ? "feedback_overdue" : "pending_feedback";
  }
  const latestRequest = [...warning.feedbackRequests]
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (latestRequest?.status === "overdue") return "feedback_overdue";
  if (warning.feedbackRecords.length > 0) return "feedback_received";
  return "not_requested";
}

export function getFeedbackActionAvailability(
  warning: WarningItem,
  currentTime: string,
): FeedbackActionAvailability {
  if (warning.currentStatus !== "formal_warning") {
    return { kind: "hidden", label: "请求补充反馈", disabled: true, message: "" };
  }

  const activeRequest = [...warning.feedbackRequests]
    .filter((request) => request.status === "pending")
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (activeRequest && currentTime <= activeRequest.deadline) {
    return {
      kind: "waiting",
      label: "等待反馈",
      disabled: true,
      message: `当前反馈任务正在进行中，请等待班主任在 ${activeRequest.deadline} 前提交反馈。`,
    };
  }
  if (activeRequest) {
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  const latestRequest = [...warning.feedbackRequests]
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (latestRequest?.status === "overdue") {
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  return { kind: "request", label: "请求补充反馈", disabled: false, message: "" };
}
