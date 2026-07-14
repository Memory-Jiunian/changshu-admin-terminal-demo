import {
  riskLevelLabels,
  type ConfirmFormalWarningValues,
  type WarningActionSubmission,
  type WarningItem,
  type WarningReferralRecord,
  type WarningTimelineItem,
} from "@/types/warning";
import { getFeedbackActionAvailability } from "@/lib/warning-feedback";

type ApplyWarningActionResult =
  | { success: true; warning: WarningItem; message: string }
  | { success: false; message: string };

function makeId(prefix: string, warning: WarningItem, occurredAt: string, offset = 0) {
  return `${prefix}-${warning.id}-${occurredAt.replace(/\D/g, "")}-${offset}`;
}

function timelineItem(
  warning: WarningItem,
  occurredAt: string,
  title: string,
  description: string,
  offset = 0,
): WarningTimelineItem {
  return {
    id: makeId("TL", warning, occurredAt, offset),
    title,
    operator: warning.responsibleTeacher,
    occurredAt,
    description,
  };
}

function withActivity(
  warning: WarningItem,
  occurredAt: string,
  latestActivity: string,
  updates: Partial<WarningItem>,
): WarningItem {
  return {
    ...warning,
    ...updates,
    latestActivity,
    activityTime: occurredAt,
  };
}

function getLatestRetest(warning: WarningItem) {
  return [...warning.retestRecords].sort((left, right) =>
    right.arrangedAt.localeCompare(left.arrangedAt),
  )[0];
}

export function applyWarningAction(
  warning: WarningItem,
  submission: WarningActionSubmission,
  occurredAt: string,
): ApplyWarningActionResult {
  switch (submission.type) {
    case "end_review": {
      const endReason = submission.values.endReason.trim();
      return {
        success: true,
        message: "已结束本次线索处理，事项已从活动列表移除。",
        warning: withActivity(warning, occurredAt, "已结束本次线索处理", {
          isActive: false,
          disposition: "ended_without_warning",
          endedAt: occurredAt,
          endReason,
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              "结束本次线索处理",
              `心理老师确认本次不形成正式预警。结束原因：${endReason}。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "continue_observation": {
      const { observationNote, nextReviewAt } = submission.values;
      return {
        success: true,
        message: "已更新为观察中。",
        warning: withActivity(warning, occurredAt, "心理老师标记继续观察", {
          currentStatus: "observing",
          observationNote: observationNote.trim(),
          nextReviewAt,
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              "标记继续观察",
              `观察说明：${observationNote.trim()}；下次复核时间：${nextReviewAt}。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "request_feedback": {
      const { feedbackRequestNote, feedbackDeadline } = submission.values;
      const availability = getFeedbackActionAvailability(warning, occurredAt);
      if (availability.kind === "waiting") {
        return { success: false, message: availability.message };
      }
      if (availability.kind === "hidden") {
        return { success: false, message: "当前事项已有班主任反馈，无需再次请求。" };
      }
      if (feedbackDeadline <= occurredAt) {
        return { success: false, message: "反馈截止时间必须晚于当前时间。" };
      }
      const isRerequest = availability.kind === "rerequest";
      const feedbackRequests = warning.feedbackRequests.map((request) =>
        request.status === "pending" ? { ...request, status: "overdue" as const } : request,
      );
      return {
        success: true,
        message: isRerequest ? "已重新向班主任请求反馈。" : "已向班主任请求补充反馈。",
        warning: withActivity(warning, occurredAt, isRerequest ? "已重新请求班主任反馈" : "已请求班主任补充反馈", {
          feedbackStatus: "pending_feedback",
          hasUnreadFeedback: false,
          feedbackRequestNote: feedbackRequestNote.trim(),
          feedbackDeadline,
          feedbackRequests: [
            {
              id: makeId("FQ", warning, occurredAt, warning.feedbackRequests.length),
              requestedAt: occurredAt,
              requestedBy: warning.responsibleTeacher,
              requestNote: feedbackRequestNote.trim(),
              deadline: feedbackDeadline,
              status: "pending",
            },
            ...feedbackRequests,
          ],
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              isRerequest ? "重新请求反馈" : "请求补充反馈",
              `心理老师向班主任${warning.headTeacherName}请求补充事实观察。要求：${feedbackRequestNote.trim()}；截止时间：${feedbackDeadline}。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "record_intervention":
    case "add_intervention": {
      const values = submission.values;
      const record = {
        id: makeId("IR", warning, values.occurredAt, warning.interventionRecords.length),
        occurredAt: values.occurredAt,
        authorName: warning.responsibleTeacher,
        method: values.method.trim(),
        summary: values.summary.trim(),
        judgment: values.judgment.trim(),
        followUpPlan: values.followUpPlan.trim(),
      };
      return {
        success: true,
        message: "干预记录已保存。",
        warning: withActivity(warning, values.occurredAt, "心理老师新增干预记录", {
          currentStatus: "in_intervention",
          interventionRecords: [record, ...warning.interventionRecords],
          timeline: [
            timelineItem(
              warning,
              values.occurredAt,
              "新增干预记录",
              `心理老师完成${record.method}。本次判断：${record.judgment}；后续计划：${record.followUpPlan}。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "schedule_retest": {
      const values = submission.values;
      if (values.plannedAt <= values.arrangedAt) {
        return { success: false, message: "计划复测时间必须晚于安排时间。" };
      }
      if (values.scaleIds.length === 0 || values.scaleNames.length === 0) {
        return { success: false, message: "请至少选择一项复测量表。" };
      }
      const record = {
        id: makeId("RR", warning, values.arrangedAt, warning.retestRecords.length),
        arrangedAt: values.arrangedAt,
        plannedAt: values.plannedAt,
        scaleIds: values.scaleIds,
        scaleNames: values.scaleNames,
        note: values.note.trim() || undefined,
      };
      return {
        success: true,
        message: "复测已安排，事项已进入待复测。",
        warning: withActivity(warning, values.arrangedAt, "心理老师安排复测", {
          currentStatus: "pending_retest",
          retestRecords: [record, ...warning.retestRecords],
          timeline: [
            timelineItem(
              warning,
              values.arrangedAt,
              "安排复测",
              `心理老师安排复测，量表：${record.scaleNames.join("、")}；计划时间：${record.plannedAt}。系统已生成班主任待复测提醒，并已同步通知对应班主任。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "start_referral": {
      const values = submission.values;
      const record: WarningReferralRecord = {
        id: makeId("RF", warning, occurredAt, warning.referralRecords.length),
        referredAt: occurredAt,
        referralType: values.referralType.trim(),
        organization: values.organization.trim() || undefined,
        reason: values.reason.trim(),
      };
      return {
        success: true,
        message: "转介已发起，事项已进入转介中。",
        warning: withActivity(warning, occurredAt, "心理老师发起转介", {
          currentStatus: "referral",
          referralRecords: [record, ...warning.referralRecords],
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              "发起转介",
              `心理老师发起${record.referralType}。转介原因：${record.reason}。系统已同步通知对应班主任。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "record_referral_result": {
      const recordIndex = warning.referralRecords.findIndex(
        (record) => !record.resultRecordedAt,
      );
      if (recordIndex < 0) {
        return { success: false, message: "当前没有待记录结果的转介事项。" };
      }

      const referralRecords = warning.referralRecords.map((record, index) =>
        index === recordIndex
          ? {
              ...record,
              resultRecordedAt: submission.values.resultRecordedAt,
              resultSummary: submission.values.resultSummary.trim(),
            }
          : record,
      );
      return {
        success: true,
        message: "转介结果已记录，事项保持转介中。",
        warning: withActivity(warning, submission.values.resultRecordedAt, "心理老师记录转介结果", {
          currentStatus: "referral",
          referralRecords,
          timeline: [
            timelineItem(
              warning,
              submission.values.resultRecordedAt,
              "记录转介结果",
              `心理老师记录外部转介反馈：${submission.values.resultSummary.trim()}。事项保持转介中，不自动生成复测结果。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "update_retest_status": {
      const latestRetest = getLatestRetest(warning);
      if (!latestRetest?.completedAt) {
        return { success: false, message: "最近一次复测尚未完成，不能更新状态。" };
      }

      if (submission.values.outcome === "close") {
        return {
          success: true,
          message: "风险已解除，事项已完成闭环归档。",
          warning: withActivity(warning, occurredAt, "心理老师完成闭环归档", {
            currentStatus: "closed",
            timeline: [
              timelineItem(
                warning,
                occurredAt,
                "完成闭环归档",
                "心理老师确认本次风险事项完成闭环归档，系统已同步通知对应班主任。",
                1,
              ),
              timelineItem(
                warning,
                occurredAt,
                "更新复测状态",
                "心理老师根据已完成复测结果作出风险解除并闭环判断，系统已同步通知对应班主任。",
              ),
              ...warning.timeline,
            ],
          }),
        };
      }

      if (submission.values.outcome === "continue_intervention") {
        return {
          success: true,
          message: "已根据复测结果继续干预。",
          warning: withActivity(warning, occurredAt, "复测后继续干预", {
            currentStatus: "in_intervention",
            timeline: [
              timelineItem(
                warning,
                occurredAt,
                "更新复测状态",
                "心理老师根据复测结果决定继续干预，系统已同步通知对应班主任。",
              ),
              ...warning.timeline,
            ],
          }),
        };
      }

      const referralRecord: WarningReferralRecord = {
        id: makeId("RF", warning, occurredAt, warning.referralRecords.length),
        referredAt: occurredAt,
        referralType: "复测后转介",
        reason: "心理老师根据复测结果决定转介",
      };
      return {
        success: true,
        message: "已根据复测结果发起转介。",
        warning: withActivity(warning, occurredAt, "复测后发起转介", {
          currentStatus: "referral",
          referralRecords: [referralRecord, ...warning.referralRecords],
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              "发起转介",
              "心理老师根据复测结果发起转介，系统已同步通知对应班主任。",
              1,
            ),
            timelineItem(
              warning,
              occurredAt,
              "更新复测状态",
              "心理老师根据已完成复测结果决定转介，系统已同步通知对应班主任。",
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
  }
}

export function applyConfirmFormalWarning(
  warning: WarningItem,
  values: ConfirmFormalWarningValues,
  occurredAt: string,
): WarningItem {
  const confirmedLabel = riskLevelLabels[values.confirmedRiskLevel];
  const adjustmentReason = values.riskLevelAdjustmentReason.trim();
  const judgmentNote = values.judgmentNote.trim();
  const feedbackRequestNote = values.feedbackRequestNote.trim();
  const descriptionParts = [
    `心理老师完成复核，正式确认风险等级为${confirmedLabel}`,
    adjustmentReason ? `调整理由：${adjustmentReason}` : "",
    judgmentNote ? `判断说明：${judgmentNote}` : "",
    `补充反馈要求：${feedbackRequestNote}`,
    `反馈截止时间：${values.feedbackDeadline}`,
    `系统已同步生成班主任${warning.headTeacherName}协作任务并通知对应班主任`,
  ].filter(Boolean);

  return withActivity(warning, occurredAt, "已确认正式预警", {
    currentStatus: "formal_warning",
    confirmedRiskLevel: values.confirmedRiskLevel,
    riskLevelAdjustmentReason: adjustmentReason || undefined,
    feedbackStatus: "pending_feedback",
    hasUnreadFeedback: false,
    feedbackRequestNote,
    feedbackDeadline: values.feedbackDeadline,
    feedbackRequests: [
      {
        id: makeId("FQ", warning, occurredAt, warning.feedbackRequests.length),
        requestedAt: occurredAt,
        requestedBy: warning.responsibleTeacher,
        requestNote: feedbackRequestNote,
        deadline: values.feedbackDeadline,
        status: "pending",
      },
      ...warning.feedbackRequests,
    ],
    timeline: [
      timelineItem(
        warning,
        occurredAt,
        "确认正式预警",
        `${descriptionParts.join("；")}。`,
      ),
      ...warning.timeline,
    ],
  });
}
