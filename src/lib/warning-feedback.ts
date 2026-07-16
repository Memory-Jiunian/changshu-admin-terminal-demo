import type { FeedbackStatus, WarningItem } from "@/types/warning";

export type FeedbackActionAvailability =
  | { kind: "request"; label: "请求补充反馈"; disabled: false; message: "" }
  | { kind: "waiting"; label: "等待反馈"; disabled: true; message: string }
  | { kind: "rerequest"; label: "重新请求反馈"; disabled: false; message: "" }
  | { kind: "hidden"; label: "请求补充反馈"; disabled: true; message: "" };

export type ObservationFeedbackActionAvailability =
  | { kind: "waiting"; label: "等待班主任反馈"; disabled: true; message: string }
  | { kind: "continue"; label: "继续观察"; disabled: false; message: "" }
  | { kind: "rerequest"; label: "重新请求反馈"; disabled: false; message: "" }
  | { kind: "missing"; label: "继续观察"; disabled: false; message: string };

function newestRequest(warning: WarningItem) {
  return [...warning.feedbackRequests]
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
}

function requestRecords(warning: WarningItem, requestId: string) {
  return warning.feedbackRecords.filter((record) => record.requestId === requestId);
}

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
    if (requestRecords(warning, activeRequest.id).length > 0) return "feedback_received";
    return currentTime > activeRequest.deadline ? "feedback_overdue" : "pending_feedback";
  }
  const latestRequest = newestRequest(warning);
  if (latestRequest?.status === "overdue") return "feedback_overdue";
  if (warning.feedbackRecords.length > 0) return "feedback_received";
  return "not_requested";
}

export function getFeedbackDataIssues(warning: WarningItem, currentTime: string) {
  const issues: string[] = [];
  const activeRequests = warning.feedbackRequests.filter((request) => request.status === "pending");
  if (activeRequests.length > 1) issues.push("存在多条进行中的班主任反馈请求。");
  if (
    warning.isActive &&
    warning.currentStatus !== "pending_review" &&
    warning.currentStatus !== "closed" &&
    warning.feedbackRequests.length === 0
  ) {
    issues.push("活动事项已进入观察或正式预警流程，但缺少班主任反馈请求。");
  }
  return issues;
}

export function getObservationFeedbackActionAvailability(
  warning: WarningItem,
  currentTime: string,
): ObservationFeedbackActionAvailability {
  const latestRequest = newestRequest(warning);
  if (!latestRequest) {
    return {
      kind: "missing",
      label: "继续观察",
      disabled: false,
      message: "当前观察事项缺少反馈请求，请在提交时建立新的协作轮次。",
    };
  }
  const records = requestRecords(warning, latestRequest.id);
  if (records.length > 0 || latestRequest.status === "completed") {
    return { kind: "continue", label: "继续观察", disabled: false, message: "" };
  }
  if (latestRequest.status === "overdue" || currentTime > latestRequest.deadline) {
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  return {
    kind: "waiting",
    label: "等待班主任反馈",
    disabled: true,
    message: `当前反馈任务正在进行中，请等待班主任在 ${latestRequest.deadline} 前提交反馈。`,
  };
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
    if (requestRecords(warning, activeRequest.id).length > 0) {
      return { kind: "hidden", label: "请求补充反馈", disabled: true, message: "" };
    }
    return {
      kind: "waiting",
      label: "等待反馈",
      disabled: true,
      message: `当前反馈任务正在进行中，请等待班主任在 ${activeRequest.deadline} 前提交反馈。`,
    };
  }
  if (activeRequest) {
    if (requestRecords(warning, activeRequest.id).length > 0) {
      return { kind: "hidden", label: "请求补充反馈", disabled: true, message: "" };
    }
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  if (warning.feedbackRecords.length > 0) {
    return { kind: "hidden", label: "请求补充反馈", disabled: true, message: "" };
  }
  const latestRequest = [...warning.feedbackRequests]
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
  if (latestRequest?.status === "overdue") {
    return { kind: "rerequest", label: "重新请求反馈", disabled: false, message: "" };
  }
  return { kind: "request", label: "请求补充反馈", disabled: false, message: "" };
}
