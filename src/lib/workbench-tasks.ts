import { getEffectiveFeedbackStatus, hasUnreadWarningFeedback } from "@/lib/warning-feedback";
import {
  getInterventionAppointmentTiming,
  getLatestPlannedInterventionAppointment,
} from "@/lib/intervention-appointments";
import {
  getLatestCompletedRetest,
  getLatestPlannedRetest,
  isRetestIncompleteAfterGrace,
} from "@/lib/warning-retests";
import { getEffectiveRiskLevel, type ActiveWarningRiskLevel, type WarningItem } from "@/types/warning";
import {
  workbenchReminderSections,
  workbenchTaskSections,
  type WorkbenchDataIssue,
  type WorkbenchReminder,
  type WorkbenchResult,
  type WorkbenchTask,
  type WorkbenchTaskType,
} from "@/types/workbench";

const riskPriority: Record<ActiveWarningRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
};

function datePart(value: string) {
  return value.slice(0, 10);
}

function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
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

function arrangementPriority(state: WorkbenchReminder["state"]) {
  if (state === "intervention_confirmation_required") return 0;
  if (state === "retest_incomplete") return 1;
  return 2;
}

function sortArrangements(items: WorkbenchReminder[]) {
  return [...items].sort((left, right) =>
    arrangementPriority(left.state) - arrangementPriority(right.state) ||
    left.plannedAt.localeCompare(right.plannedAt) ||
    left.id.localeCompare(right.id),
  );
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
      const latestPlannedRetest = getLatestPlannedRetest(warning);
      const latestCompletedRetest = getLatestCompletedRetest(warning);
      if (!latestPlannedRetest && !latestCompletedRetest) {
        dataIssues.push({ id: `${warning.id}:missing-retest`, warningId: warning.id, message: "待复测事项缺少复测记录。" });
      }
      if (
        latestCompletedRetest &&
        (!latestPlannedRetest || latestCompletedRetest.arrangedAt >= latestPlannedRetest.arrangedAt)
      ) {
        tasks.push(makeTask(warning, "retest_result_pending", "学生已完成复测，等待心理老师更新状态。", latestCompletedRetest.completedAt!, currentDate));
      }
      if (latestPlannedRetest && isRetestIncompleteAfterGrace(latestPlannedRetest, currentTime)) {
        reminders.push({
          id: `${warning.id}:retest_plan_today`, kind: "reminder", type: "retest_plan_today",
          warningId: warning.id, studentId: warning.studentId, studentName: warning.studentName,
          gradeClass: warning.gradeClass, riskLevel: getEffectiveRiskLevel(warning),
          responsibleTeacher: warning.responsibleTeacher, reason: "复测计划已超过完成宽限期，等待查看并重新安排。",
          plannedAt: latestPlannedRetest.plannedAt, scaleNames: [...latestPlannedRetest.scaleNames],
          targetSection: workbenchReminderSections.retest_plan_today,
          state: "retest_incomplete",
          statusLabel: "复测未完成",
          ctaLabel: "查看并重新安排",
        });
      } else if (latestPlannedRetest && [currentDate, nextDate(currentDate)].includes(datePart(latestPlannedRetest.plannedAt))) {
        reminders.push({
          id: `${warning.id}:retest_plan_today`, kind: "reminder", type: "retest_plan_today",
          warningId: warning.id, studentId: warning.studentId, studentName: warning.studentName,
          gradeClass: warning.gradeClass, riskLevel: getEffectiveRiskLevel(warning),
          responsibleTeacher: warning.responsibleTeacher, reason: "学生有今日或次日复测计划。",
          plannedAt: latestPlannedRetest.plannedAt, scaleNames: [...latestPlannedRetest.scaleNames],
          targetSection: workbenchReminderSections.retest_plan_today,
          state: "upcoming",
          statusLabel: "复测安排",
          ctaLabel: "查看安排",
        });
      }
    }

    const activeAppointment = getLatestPlannedInterventionAppointment(
      warning.interventionAppointments,
    );
    if (warning.currentStatus === "formal_warning" && !activeAppointment) {
      const wasCancelled = warning.interventionAppointments.some(
        (appointment) => appointment.status === "cancelled",
      );
      tasks.push(makeTask(
        warning,
        "intervention_unscheduled",
        wasCancelled
          ? "原干预预约已取消，请重新安排干预。"
          : "正式预警已确认，尚未预约首次干预。",
        warning.activityTime,
        currentDate,
      ));
    }
    if (warning.currentStatus === "in_intervention") {
      if (!activeAppointment) {
        dataIssues.push({ id: `${warning.id}:missing-intervention-appointment`, warningId: warning.id, message: "待干预事项没有有效预约，请尽快重新安排。" });
      } else {
        const timing = getInterventionAppointmentTiming(activeAppointment, currentTime);
        if (timing === "confirmation_required") {
          reminders.push({
            id: `${warning.id}:intervention_plan_upcoming`, kind: "reminder", type: "intervention_plan_upcoming",
            warningId: warning.id, studentId: warning.studentId, studentName: warning.studentName,
            gradeClass: warning.gradeClass, riskLevel: getEffectiveRiskLevel(warning),
            responsibleTeacher: warning.responsibleTeacher, reason: "干预预约已超过结果记录宽限期，等待心理老师确认。",
            plannedAt: activeAppointment.plannedAt, location: activeAppointment.location,
            targetSection: workbenchReminderSections.intervention_plan_upcoming,
            state: "intervention_confirmation_required",
            statusLabel: "预约时间已过 · 待确认",
            ctaLabel: "确认干预情况",
          });
        } else if ([currentDate, nextDate(currentDate)].includes(datePart(activeAppointment.plannedAt))) {
        reminders.push({
          id: `${warning.id}:intervention_plan_upcoming`, kind: "reminder", type: "intervention_plan_upcoming",
          warningId: warning.id, studentId: warning.studentId, studentName: warning.studentName,
          gradeClass: warning.gradeClass, riskLevel: getEffectiveRiskLevel(warning),
          responsibleTeacher: warning.responsibleTeacher, reason: "学生有今日或次日干预预约。",
          plannedAt: activeAppointment.plannedAt, location: activeAppointment.location,
          targetSection: workbenchReminderSections.intervention_plan_upcoming,
          state: "upcoming",
          statusLabel: timing === "awaiting_result" ? "预约进行中 · 等待结果记录" : "干预预约",
          ctaLabel: "查看安排",
        });
        }
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
    reminders: sortArrangements(reminders),
    dataIssues,
  };
}
