import { getEffectiveFeedbackStatus, hasUnreadWarningFeedback } from "@/lib/warning-feedback";
import { getEffectiveRiskLevel, type RiskLevel, type WarningItem } from "@/types/warning";
import {
  workbenchReminderSections,
  workbenchTaskSections,
  type WorkbenchDataIssue,
  type WorkbenchReminder,
  type WorkbenchResult,
  type WorkbenchTask,
  type WorkbenchTaskType,
} from "@/types/workbench";

const riskPriority: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function datePart(value: string) {
  return value.slice(0, 10);
}

function isValidDateTime(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(value));
}

function latestBy<T>(items: T[], getTime: (item: T) => string) {
  return [...items].sort((left, right) => getTime(right).localeCompare(getTime(left)))[0];
}

function makeTask(
  warning: WarningItem,
  type: WorkbenchTaskType,
  reason: string,
  triggeredAt: string,
  currentDate: string,
  dueAt?: string,
): WorkbenchTask {
  return {
    id: `${warning.id}:${type}`,
    kind: "task",
    type,
    warningId: warning.id,
    studentId: warning.studentId,
    studentName: warning.studentName,
    gradeClass: warning.gradeClass,
    riskLevel: getEffectiveRiskLevel(warning),
    responsibleTeacher: warning.responsibleTeacher,
    reason,
    triggeredAt,
    dueAt,
    isOverdue: Boolean(dueAt && datePart(dueAt) < currentDate),
    isDueToday: Boolean(dueAt && datePart(dueAt) === currentDate),
    targetSection: workbenchTaskSections[type],
  };
}

function sortTasks(tasks: WorkbenchTask[]) {
  return [...tasks].sort((left, right) => {
    if (left.isOverdue !== right.isOverdue) return left.isOverdue ? -1 : 1;
    if (left.isDueToday !== right.isDueToday) return left.isDueToday ? -1 : 1;
    const riskDifference = riskPriority[right.riskLevel] - riskPriority[left.riskLevel];
    if (riskDifference !== 0) return riskDifference;
    return left.triggeredAt.localeCompare(right.triggeredAt) || left.id.localeCompare(right.id);
  });
}

export function buildWorkbenchItems({
  warnings,
  currentTeacher,
  currentTime,
}: {
  warnings: WarningItem[];
  currentTeacher: string;
  currentTime: string;
}): WorkbenchResult {
  const tasks: WorkbenchTask[] = [];
  const reminders: WorkbenchReminder[] = [];
  const dataIssues: WorkbenchDataIssue[] = [];
  const currentDate = datePart(currentTime);
  const activeByStudent = new Map<string, number>();

  for (const warning of warnings) {
    if (!warning.isActive || warning.currentStatus === "closed" || warning.responsibleTeacher !== currentTeacher) continue;

    if (!warning.id || !warning.studentId) {
      dataIssues.push({ id: `missing-identity-${warning.id || "unknown"}`, warningId: warning.id, message: "事项缺少 warningId 或 studentId，无法安全进入详情。" });
      continue;
    }
    activeByStudent.set(warning.studentId, (activeByStudent.get(warning.studentId) ?? 0) + 1);

    if (warning.currentStatus === "pending_review") {
      tasks.push(makeTask(warning, "pending_review", "补充评估已完成，等待心理老师复核。", warning.activityTime, currentDate));
    }

    if (warning.currentStatus === "observing" && warning.nextReviewAt) {
      if (!isValidDateTime(warning.nextReviewAt)) {
        dataIssues.push({ id: `${warning.id}:invalid-review-time`, warningId: warning.id, message: "观察复核时间格式无效。" });
      } else if (datePart(warning.nextReviewAt) <= currentDate) {
        tasks.push(makeTask(warning, "observation_due", datePart(warning.nextReviewAt) < currentDate ? "观察复核已逾期。" : "观察复核今天到期。", warning.nextReviewAt, currentDate, warning.nextReviewAt));
      }
    }

    const latestFeedback = latestBy(warning.feedbackRecords, (record) => record.submittedAt);
    if (hasUnreadWarningFeedback(warning) && latestFeedback) {
      tasks.push(makeTask(warning, "new_feedback", "班主任已提交新的事实观察，等待查看。", latestFeedback.submittedAt, currentDate));
    } else if (getEffectiveFeedbackStatus(warning, currentTime) === "feedback_overdue") {
      const dueAt = warning.feedbackDeadline;
      if (isValidDateTime(dueAt)) {
        tasks.push(makeTask(warning, "feedback_overdue", "班主任反馈任务已超过截止时间。", dueAt!, currentDate, dueAt));
      } else {
        dataIssues.push({ id: `${warning.id}:missing-feedback-deadline`, warningId: warning.id, message: "反馈超时事项缺少有效截止时间。" });
      }
    }

    if (warning.currentStatus === "pending_retest") {
      const latestRetest = latestBy(warning.retestRecords, (record) => record.arrangedAt);
      if (!latestRetest) {
        dataIssues.push({ id: `${warning.id}:missing-retest`, warningId: warning.id, message: "待复测事项缺少复测记录。" });
      } else if (latestRetest.completedAt) {
        tasks.push(makeTask(warning, "retest_result_pending", "学生已完成复测，等待心理老师更新状态。", latestRetest.completedAt, currentDate));
      } else if (datePart(latestRetest.plannedAt) === currentDate) {
        reminders.push({
          id: `${warning.id}:retest_plan_today`, kind: "reminder", type: "retest_plan_today",
          warningId: warning.id, studentId: warning.studentId, studentName: warning.studentName,
          gradeClass: warning.gradeClass, riskLevel: getEffectiveRiskLevel(warning),
          responsibleTeacher: warning.responsibleTeacher, reason: "学生计划今天完成复测。",
          plannedAt: latestRetest.plannedAt, scaleNames: [...latestRetest.scaleNames],
          targetSection: workbenchReminderSections.retest_plan_today,
        });
      }
    }

    if (warning.currentStatus === "referral") {
      const latestReferral = latestBy(warning.referralRecords, (record) => record.referredAt);
      if (!latestReferral) {
        dataIssues.push({ id: `${warning.id}:missing-referral`, warningId: warning.id, message: "转介中事项缺少转介记录。" });
      }
      const latestFollowUp = latestReferral
        ? latestBy(latestReferral.followUpRecords, (record) => record.occurredAt)
        : undefined;
      const count = latestReferral?.followUpRecords.length ?? 0;
      tasks.push(makeTask(
        warning,
        "referral_follow_up",
        count ? `转介仍在跟进中，已记录 ${count} 次，最近更新于 ${latestFollowUp?.occurredAt}。` : "已发起转介，尚未记录跟进情况。",
        latestFollowUp?.occurredAt ?? latestReferral?.referredAt ?? warning.activityTime,
        currentDate,
      ));
    }
  }

  for (const [studentId, count] of activeByStudent) {
    if (count > 1) dataIssues.push({ id: `multiple-active-${studentId}`, message: `学生 ${studentId} 存在 ${count} 条当前老师负责的活动事项，请核对数据。` });
  }

  return {
    tasks: sortTasks(tasks),
    reminders: [...reminders].sort((left, right) => left.plannedAt.localeCompare(right.plannedAt) || left.id.localeCompare(right.id)),
    dataIssues,
  };
}
