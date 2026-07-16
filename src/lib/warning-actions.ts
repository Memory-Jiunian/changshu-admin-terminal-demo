import {
  riskLevelLabels,
  type ConfirmFormalWarningValues,
  type InterventionAppointmentValues,
  type WarningActionSubmission,
  type WarningInterventionAppointment,
  type WarningItem,
  type WarningReferralRecord,
  type WarningTimelineItem,
} from "@/types/warning";
import { getFeedbackActionAvailability } from "@/lib/warning-feedback";
import {
  getInterventionAppointmentTiming,
  getLatestPlannedInterventionAppointment,
} from "@/lib/intervention-appointments";
import { getLatestCompletedRetest } from "@/lib/warning-retests";

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

function buildAppointment(
  warning: WarningItem,
  values: InterventionAppointmentValues,
  occurredAt: string,
  offset: number,
  rescheduledFromId?: string,
): WarningInterventionAppointment {
  return {
    id: makeId("IA", warning, occurredAt, offset),
    plannedAt: values.plannedAt,
    location: values.location.trim(),
    responsibleTeacher: values.responsibleTeacher.trim(),
    escortTeacher: values.escortTeacher.trim() || undefined,
    note: values.note.trim() || undefined,
    status: "planned",
    createdAt: occurredAt,
    createdBy: warning.responsibleTeacher,
    rescheduledFromId,
    notificationOffsetsMinutes: [...values.notificationOffsetsMinutes],
  };
}

function updateAppointment(
  warning: WarningItem,
  appointmentId: string,
  updates: Partial<WarningInterventionAppointment>,
) {
  const exists = warning.interventionAppointments.some((item) => item.id === appointmentId);
  if (!exists) return null;
  return warning.interventionAppointments.map((item) =>
    item.id === appointmentId ? { ...item, ...updates } : item,
  );
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
      const { observationNote, nextReviewAt, feedbackRequestNote, feedbackDeadline } = submission.values;
      if (!observationNote.trim() || !nextReviewAt || !feedbackRequestNote.trim() || !feedbackDeadline) {
        return { success: false, message: "请完整填写观察说明、复核时间和班主任反馈要求。" };
      }
      if (nextReviewAt <= occurredAt || feedbackDeadline <= occurredAt) {
        return { success: false, message: "复核时间和反馈截止时间必须晚于当前时间。" };
      }
      const pendingRequest = [...warning.feedbackRequests]
        .filter((request) => request.status === "pending")
        .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
      const pendingRequestHasFeedback = Boolean(
        pendingRequest && warning.feedbackRecords.some((record) => record.requestId === pendingRequest.id),
      );
      if (pendingRequest && !pendingRequestHasFeedback && occurredAt <= pendingRequest.deadline) {
        return { success: false, message: "当前已有进行中的班主任反馈任务。" };
      }
      const isRerequest = Boolean(
        pendingRequest && !pendingRequestHasFeedback && occurredAt > pendingRequest.deadline,
      );
      const feedbackRequests = warning.feedbackRequests.map((request) => {
        if (request.id !== pendingRequest?.id) return request;
        return {
          ...request,
          status: pendingRequestHasFeedback ? "completed" as const : "overdue" as const,
        };
      });
      const requestId = makeId("FQ", warning, occurredAt, warning.feedbackRequests.length);
      return {
        success: true,
        message: isRerequest ? "已重新请求班主任反馈并更新观察计划。" : "已更新观察计划并创建新一轮反馈任务。",
        warning: withActivity(warning, occurredAt, "心理老师标记继续观察", {
          currentStatus: "observing",
          observationNote: observationNote.trim(),
          nextReviewAt,
          feedbackStatus: "pending_feedback",
          feedbackRequestNote: feedbackRequestNote.trim(),
          feedbackDeadline,
          hasUnreadFeedback: false,
          feedbackRequests: [{
            id: requestId,
            requestedAt: occurredAt,
            requestedBy: warning.responsibleTeacher,
            requestNote: feedbackRequestNote.trim(),
            deadline: feedbackDeadline,
            status: "pending",
          }, ...feedbackRequests],
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              isRerequest ? "重新请求反馈" : "标记继续观察",
              `观察说明：${observationNote.trim()}；下次复核时间：${nextReviewAt}；已向班主任请求反馈：${feedbackRequestNote.trim()}；截止时间：${feedbackDeadline}。`,
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
    case "schedule_intervention": {
      const values = submission.values;
      if (values.plannedAt <= occurredAt) {
        return { success: false, message: "计划干预时间必须晚于当前时间。" };
      }
      if (!values.location.trim() || !values.responsibleTeacher.trim()) {
        return { success: false, message: "请完整填写干预地点和负责心理老师。" };
      }
      const appointment = buildAppointment(
        warning,
        values,
        occurredAt,
        warning.interventionAppointments.length,
      );
      return {
        success: true,
        message: "干预预约已创建，事项进入待干预。",
        warning: withActivity(warning, occurredAt, "心理老师预约干预", {
          currentStatus: "in_intervention",
          interventionAppointments: [appointment, ...warning.interventionAppointments],
          timeline: [
            timelineItem(
              warning,
              occurredAt,
              "预约干预",
              `计划时间：${appointment.plannedAt}；地点：${appointment.location}；负责心理老师：${appointment.responsibleTeacher}。系统已生成提前 24 小时和 2 小时的模拟通知计划。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "mark_intervention_no_show":
    case "reschedule_intervention": {
      const currentAppointment = getLatestPlannedInterventionAppointment(
        warning.interventionAppointments,
      );
      if (!currentAppointment || currentAppointment.id !== submission.values.appointmentId) {
        return { success: false, message: "当前有效干预预约不存在或已更新。" };
      }
      const timing = getInterventionAppointmentTiming(currentAppointment, occurredAt);
      if (submission.type === "mark_intervention_no_show" && timing !== "confirmation_required") {
        return { success: false, message: "预约仍在进行或宽限期内，暂不能确认未到场。" };
      }
      if (submission.type === "reschedule_intervention" && timing === "confirmation_required") {
        return { success: false, message: "预约已超过确认宽限期，请先确认未到场后重新预约。" };
      }
      const oldStatus = submission.type === "mark_intervention_no_show" ? "no_show" : "rescheduled";
      const appointments = updateAppointment(warning, submission.values.appointmentId, { status: oldStatus });
      if (!appointments) return { success: false, message: "原干预预约不存在。" };
      if (submission.values.appointment.plannedAt <= occurredAt) {
        return { success: false, message: "新的计划干预时间必须晚于当前时间。" };
      }
      const appointment = buildAppointment(
        warning,
        submission.values.appointment,
        occurredAt,
        warning.interventionAppointments.length,
        submission.values.appointmentId,
      );
      const title = submission.type === "mark_intervention_no_show" ? "确认未到场并重新预约" : "调整干预预约";
      return {
        success: true,
        message: submission.type === "mark_intervention_no_show" ? "已确认未到场并创建新预约。" : "干预预约已调整。",
        warning: withActivity(warning, occurredAt, title, {
          currentStatus: "in_intervention",
          interventionAppointments: [appointment, ...appointments],
          timeline: [
            timelineItem(warning, occurredAt, title, `原预约已标记为${oldStatus === "no_show" ? "未到场" : "已改约"}；新计划时间：${appointment.plannedAt}；地点：${appointment.location}。`),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "cancel_intervention": {
      const reason = submission.values.reason.trim();
      const appointments = updateAppointment(warning, submission.values.appointmentId, {
        status: "cancelled",
        cancelledAt: occurredAt,
        cancellationReason: reason,
      });
      if (!appointments) return { success: false, message: "干预预约不存在。" };
      if (!reason) return { success: false, message: "请填写取消原因。" };
      return {
        success: true,
        message: "干预预约已取消，事项已回到正式预警等待重新安排。",
        warning: withActivity(warning, occurredAt, "取消干预预约", {
          currentStatus: "formal_warning",
          interventionAppointments: appointments,
          timeline: [
            timelineItem(warning, occurredAt, "取消干预预约", `取消原因：${reason}。事项回到正式预警，等待重新安排干预。`),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "record_intervention_result": {
      const values = submission.values;
      const appointments = updateAppointment(warning, values.appointmentId, { status: "completed" });
      if (!appointments) return { success: false, message: "待处理的干预预约不存在。" };
      const required = [values.occurredAt, values.method, values.summary, values.judgment];
      if (required.some((value) => !value.trim())) {
        return { success: false, message: "请完整填写干预结果。" };
      }
      const nextPlanLabel = values.nextPlan === "continue_intervention"
        ? "继续干预"
        : values.nextPlan === "schedule_retest" ? "安排复测" : "发起转介";
      const record = {
        id: makeId("IR", warning, values.occurredAt, warning.interventionRecords.length),
        appointmentId: values.appointmentId,
        occurredAt: values.occurredAt,
        authorName: warning.responsibleTeacher,
        method: values.method.trim(),
        summary: values.summary.trim(),
        judgment: values.judgment.trim(),
        followUpPlan: nextPlanLabel,
      };
      let updates: Partial<WarningItem> = {
        currentStatus: "in_intervention",
        interventionAppointments: appointments,
        interventionRecords: [record, ...warning.interventionRecords],
      };
      let description = `完成${record.method}。本次判断：${record.judgment}；后续计划：${nextPlanLabel}。`;

      if (values.nextPlan === "continue_intervention") {
        if (!values.nextAppointment || values.nextAppointment.plannedAt <= values.occurredAt) {
          return { success: false, message: "继续干预必须安排晚于本次干预时间的下一次预约。" };
        }
        const nextAppointment = buildAppointment(warning, values.nextAppointment, occurredAt, appointments.length);
        updates.interventionAppointments = [nextAppointment, ...appointments];
        description += `下一次预约：${nextAppointment.plannedAt}，地点：${nextAppointment.location}。`;
        if (values.requestFeedback) {
          const note = values.feedbackRequestNote?.trim() ?? "";
          const deadline = values.feedbackDeadline ?? "";
          if (!note || deadline <= occurredAt) {
            return { success: false, message: "同时请求班主任反馈时，要求和有效截止时间必填。" };
          }
          updates.feedbackRequestNote = note;
          updates.feedbackDeadline = deadline;
          updates.feedbackStatus = "pending_feedback";
          updates.hasUnreadFeedback = false;
          updates.feedbackRequests = [{
            id: makeId("FQ", warning, occurredAt, warning.feedbackRequests.length),
            requestedAt: occurredAt,
            requestedBy: warning.responsibleTeacher,
            requestNote: note,
            deadline,
            status: "pending",
          }, ...warning.feedbackRequests];
          description += `已创建班主任反馈请求，截止时间：${deadline}。`;
        }
      } else if (values.nextPlan === "schedule_retest") {
        const retest = values.retest;
        if (!retest || retest.plannedAt <= occurredAt || retest.scaleIds.length === 0) {
          return { success: false, message: "请完整填写有效的复测计划和量表。" };
        }
        updates.currentStatus = "pending_retest";
        updates.retestRecords = [{
          id: makeId("RR", warning, occurredAt, warning.retestRecords.length),
          arrangedAt: occurredAt,
          plannedAt: retest.plannedAt,
          scaleIds: [...retest.scaleIds],
          scaleNames: [...retest.scaleNames],
          note: retest.note.trim() || undefined,
          appointmentStatus: "planned",
        }, ...warning.retestRecords];
        description += `复测时间：${retest.plannedAt}；量表：${retest.scaleNames.join("、")}。`;
      } else {
        const referral = values.referral;
        if (!referral?.referralType.trim() || !referral.reason.trim()) {
          return { success: false, message: "请完整填写转介类型和原因。" };
        }
        updates.currentStatus = "referral";
        updates.referralRecords = [{
          id: makeId("RF", warning, occurredAt, warning.referralRecords.length),
          referredAt: occurredAt,
          referralType: referral.referralType.trim(),
          organization: referral.organization.trim() || undefined,
          reason: referral.reason.trim(),
          followUpRecords: [],
        }, ...warning.referralRecords];
        description += `转介类型：${referral.referralType.trim()}；原因：${referral.reason.trim()}。`;
      }
      return {
        success: true,
        message: `干预结果已保存，后续计划为${nextPlanLabel}。`,
        warning: withActivity(warning, values.occurredAt, "心理老师记录干预结果", {
          ...updates,
          timeline: [timelineItem(warning, values.occurredAt, "记录干预结果", description), ...warning.timeline],
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
        warning: withActivity(warning, values.occurredAt, "心理老师记录干预结果", {
          currentStatus: "in_intervention",
          interventionRecords: [record, ...warning.interventionRecords],
          timeline: [
            timelineItem(
              warning,
              values.occurredAt,
              "记录干预结果",
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
        followUpRecords: [],
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
    case "add_referral_follow_up": {
      const recordIndex = warning.referralRecords
        .map((record, index) => ({ record, index }))
        .sort((left, right) => right.record.referredAt.localeCompare(left.record.referredAt))[0]?.index;
      if (recordIndex === undefined) {
        return { success: false, message: "当前没有可跟进的转介记录。" };
      }
      const values = submission.values;
      const summary = values.summary.trim();
      const conclusion = values.conclusion?.trim() ?? "";
      const authorName = values.authorName.trim();
      if (!values.occurredAt || !authorName || !summary || !conclusion) {
        return { success: false, message: "请完整填写跟进时间、记录人、事实摘要和专业结论。" };
      }
      const selectedRecord = warning.referralRecords[recordIndex];
      const duplicate = selectedRecord.followUpRecords.some(
        (item) => item.occurredAt === values.occurredAt &&
          item.authorName === authorName && item.summary === summary && item.conclusion === conclusion,
      );
      if (duplicate) {
        return { success: false, message: "相同的转介跟进已经记录，请勿重复提交。" };
      }
      const followUp = {
        id: makeId("RFF", warning, values.occurredAt, selectedRecord.followUpRecords.length),
        occurredAt: values.occurredAt,
        authorName,
        summary,
        conclusion,
      };
      const referralRecords = warning.referralRecords.map((record, index) =>
        index === recordIndex
          ? { ...record, followUpRecords: [followUp, ...record.followUpRecords] }
          : record,
      );
      return {
        success: true,
        message: "转介跟进已新增，事项保持转介中。",
        warning: withActivity(warning, values.occurredAt, "心理老师新增转介跟进", {
          currentStatus: "referral",
          referralRecords,
          timeline: [
            timelineItem(
              warning,
              values.occurredAt,
              "新增转介跟进",
              `${authorName}记录转介跟进：${summary}。专业结论：${conclusion}。事项保持转介中，不自动生成复测结果。`,
            ),
            ...warning.timeline,
          ],
        }),
      };
    }
    case "update_retest_status": {
      const latestRetest = getLatestCompletedRetest(warning);
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
        followUpRecords: [],
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
    `系统已生成班主任${warning.headTeacherName}协作任务与通知计划`,
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
