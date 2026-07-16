import { readFileSync } from "node:fs";
import ts from "../node_modules/typescript/lib/typescript.js";

function compile(path) {
  return ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function moduleUrl(code) {
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}

const typesUrl = moduleUrl(compile("src/types/warning.ts"));
const feedbackUrl = moduleUrl(compile("src/lib/warning-feedback.ts"));
const appointmentsUrl = moduleUrl(compile("src/lib/intervention-appointments.ts"));
const interventionsUrl = moduleUrl(compile("src/lib/warning-interventions.ts").replaceAll('"@/types/warning"', `"${typesUrl}"`));
const retestsUrl = moduleUrl(compile("src/lib/warning-retests.ts"));
const recordsUrl = moduleUrl(compile("src/lib/warning-records.ts").replaceAll('"@/types/warning"', `"${typesUrl}"`));
const actionsCode = compile("src/lib/warning-actions.ts")
  .replaceAll('"@/types/warning"', `"${typesUrl}"`)
  .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`)
  .replaceAll('"@/lib/intervention-appointments"', `"${appointmentsUrl}"`)
  .replaceAll('"@/lib/warning-retests"', `"${retestsUrl}"`);
const [types, feedback, appointments, interventions, retests, records, actions, mock] = await Promise.all([
  import(typesUrl),
  import(feedbackUrl),
  import(appointmentsUrl),
  import(interventionsUrl),
  import(retestsUrl),
  import(recordsUrl),
  import(moduleUrl(actionsCode)),
  import(moduleUrl(compile("src/data/warningMock.ts"))),
]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}
function findWarning(id) {
  return structuredClone(mock.warningMockData.find((warning) => warning.id === id));
}

const currentTime = "2026-07-08 12:00";
assert(mock.warningMockData.length >= 12, "mock covers Phase 4.6 cases");
assert(new Set(mock.warningMockData.filter((item) => item.isActive).map((item) => item.currentStatus)).size === 7, "seven statuses remain covered");
assert(mock.warningMockData.every((item) => item.studentId && item.headTeacherName && item.headTeacherPhone.includes("****")), "teacher contact is present and masked");
assert(mock.warningMockData.flatMap((item) => item.retestRecords).every((record) => record.scaleIds.length > 0 && record.scaleNames.length > 0), "all retests identify scales");
assert(mock.warningMockData.some((item) => item.deepAssessmentRecords.some((record) => record.responses.length > 0)), "deep assessments include complete responses");
assert(mock.warningMockData.some((item) => item.aiConversationRecords.some((record) => record.messages.length > 0)), "AI evidence includes visible messages");
assert(mock.warningMockData.filter((item) => item.isActive).every((item) => item.suggestedRiskLevel !== "low" && item.confirmedRiskLevel !== "low"), "active warnings exclude low risk");
assert(mock.warningMockData.some((item) => item.deepAssessmentRecords.some((record) => record.riskLevel === "low")), "assessment and profile facts still support low risk");

const pendingFeedback = findWarning("WRN-20260708-003");
const overdueFeedback = findWarning("WRN-20260708-012");
const receivedFeedback = findWarning("WRN-20260703-008");
const unreadFeedback = findWarning("WRN-20260707-004");
assert(feedback.getEffectiveFeedbackStatus(pendingFeedback, currentTime) === "pending_feedback", "pending feedback derives from deadline");
assert(feedback.getEffectiveFeedbackStatus(overdueFeedback, currentTime) === "feedback_overdue", "overdue feedback derives from deadline");
assert(feedback.getEffectiveFeedbackStatus(receivedFeedback, currentTime) === "feedback_received", "read feedback is received");
assert(feedback.getEffectiveFeedbackStatus(unreadFeedback, currentTime) === "new_feedback", "unread feedback is new");
const unreadTimeline = unreadFeedback.timeline;
const unreadRecordCount = unreadFeedback.feedbackRecords.length;
const unreadRecordIds = unreadFeedback.feedbackRecords.filter((record) => !record.psychologistReadAt).map((record) => record.id);
const markedRead = feedback.markWarningFeedbackRead({ warning: unreadFeedback, readAt: currentTime });
assert(markedRead.feedbackRecords.length === unreadRecordCount, "mark read preserves feedback records");
assert(markedRead.feedbackRecords.filter((record) => unreadRecordIds.includes(record.id)).every((record) => record.psychologistReadAt === currentTime), "mark read stamps unread feedback records");
assert(markedRead.feedbackRecords.every((record) => record.psychologistReadAt), "mark read leaves no unread feedback records");
assert(!feedback.hasUnreadWarningFeedback(markedRead), "all stamped feedback derives as read");
assert(markedRead.timeline === unreadTimeline, "mark read does not write business timeline");
assert(feedback.getFeedbackActionAvailability(pendingFeedback, currentTime).kind === "waiting", "pending task blocks duplicate request");
assert(feedback.getFeedbackActionAvailability(overdueFeedback, currentTime).kind === "rerequest", "overdue task allows re-request");
assert(feedback.getFeedbackActionAvailability(receivedFeedback, currentTime).kind === "hidden", "formal warning hides repeat request after feedback is received");

const blockedRequest = actions.applyWarningAction(pendingFeedback, { type: "request_feedback", values: { feedbackRequestNote: "note", feedbackDeadline: "2026-07-10 10:00" } }, currentTime);
assert(!blockedRequest.success, "service blocks duplicate in-progress request");
const rerequest = actions.applyWarningAction(overdueFeedback, { type: "request_feedback", values: { feedbackRequestNote: "note", feedbackDeadline: "2026-07-10 10:00" } }, currentTime);
assert(rerequest.success, "overdue feedback can be requested again");
assert(rerequest.warning.feedbackStatus === "pending_feedback", "re-request returns to pending");
assert(rerequest.warning.feedbackRequests.length === overdueFeedback.feedbackRequests.length + 1, "re-request preserves request history");
assert(rerequest.warning.timeline[0].title === "重新请求反馈", "re-request writes the correct timeline event");
const repeatedRequest = actions.applyWarningAction(receivedFeedback, { type: "request_feedback", values: { feedbackRequestNote: "new round", feedbackDeadline: "2026-07-10 16:00" } }, currentTime);
assert(!repeatedRequest.success, "formal warning does not open another round after feedback is received");

const review = findWarning("WRN-20260708-001");
const confirmed = actions.applyConfirmFormalWarning(review, { confirmedRiskLevel: "medium", judgmentNote: "note", riskLevelAdjustmentReason: "reason", feedbackRequestNote: "observe attendance", feedbackDeadline: "2026-07-10 17:00" }, currentTime);
assert(confirmed.currentStatus === "formal_warning", "confirmation changes main status");
assert(confirmed.confirmedRiskLevel === "medium", "confirmation stores risk");
assert(confirmed.feedbackDeadline === "2026-07-10 17:00", "confirmation stores deadline");
assert(confirmed.feedbackRequests.length === 1, "confirmation creates first request");
assert(confirmed.timeline[0].description.includes("observe attendance"), "confirmation timeline includes request");

const observed = actions.applyWarningAction(review, { type: "continue_observation", values: { observationNote: "observe", nextReviewAt: "2026-07-10 10:00", feedbackRequestNote: "observe attendance", feedbackDeadline: "2026-07-09 17:00" } }, currentTime);
assert(observed.success && observed.warning.currentStatus === "observing", "observation transition works");
assert(observed.warning.feedbackRequests.length === 1 && observed.warning.feedbackStatus === "pending_feedback", "observation creates a feedback request");
const observingWaiting = findWarning("WRN-20260708-002");
const observingReceived = findWarning("WRN-20260708-014");
const observingOverdue = findWarning("WRN-20260708-015");
assert(feedback.getObservationFeedbackActionAvailability(observingWaiting, currentTime).kind === "waiting", "observing waits while the current request is active");
assert(feedback.getObservationFeedbackActionAvailability(observingReceived, currentTime).kind === "continue", "observing continues after current-round feedback");
assert(feedback.getObservationFeedbackActionAvailability(observingOverdue, currentTime).kind === "rerequest", "observing can re-request after timeout");
const nextObservationRound = actions.applyWarningAction(observingReceived, { type: "continue_observation", values: { observationNote: "继续观察到校表现", nextReviewAt: "2026-07-10 10:00", feedbackRequestNote: "补充课堂参与事实", feedbackDeadline: "2026-07-09 17:00" } }, currentTime);
assert(nextObservationRound.success && nextObservationRound.warning.feedbackRequests.length === observingReceived.feedbackRequests.length + 1, "received observing feedback creates a new round");
const renewedObservation = actions.applyWarningAction(observingOverdue, { type: "continue_observation", values: { observationNote: "继续观察同伴互动", nextReviewAt: "2026-07-10 10:00", feedbackRequestNote: "重新反馈同伴互动", feedbackDeadline: "2026-07-09 17:00" } }, currentTime);
assert(renewedObservation.success && renewedObservation.warning.feedbackRequests.some((item) => item.status === "overdue"), "overdue observing feedback preserves the old overdue round");
const ended = actions.applyWarningAction(review, { type: "end_review", values: { endReason: "resolved" } }, currentTime);
assert(ended.success && !ended.warning.isActive && ended.warning.disposition === "ended_without_warning", "end review removes active item without a new status");
const intervention = actions.applyWarningAction(receivedFeedback, { type: "record_intervention", values: { occurredAt: currentTime, method: "talk", summary: "summary", judgment: "judgment", followUpPlan: "plan" } }, currentTime);
assert(intervention.success && intervention.warning.currentStatus === "in_intervention", "intervention changes status");
assert(intervention.warning.interventionRecords.length === receivedFeedback.interventionRecords.length + 1, "intervention appends a record");

const appointmentValues = { plannedAt: "2026-07-08 13:00", location: "心理咨询室", responsibleTeacher: receivedFeedback.responsibleTeacher, escortTeacher: receivedFeedback.headTeacherName, note: "bring notes", notificationOffsetsMinutes: [1440, 120] };
const appointment = actions.applyWarningAction(receivedFeedback, { type: "schedule_intervention", values: appointmentValues }, currentTime);
assert(appointment.success && appointment.warning.currentStatus === "in_intervention", "formal warning schedules intervention without feedback gating");
assert(appointment.warning.interventionAppointments[0].status === "planned", "appointment uses planned sub-status");
assert(appointment.warning.interventionAppointments[0].notificationOffsetsMinutes.join(",") === "1440,120", "appointment stores mock notification offsets");
const pendingFeedbackAppointment = actions.applyWarningAction(pendingFeedback, { type: "schedule_intervention", values: appointmentValues }, currentTime);
assert(pendingFeedbackAppointment.success, "pending homeroom feedback does not block intervention scheduling");
const blockedNoShow = actions.applyWarningAction(appointment.warning, { type: "mark_intervention_no_show", values: { appointmentId: appointment.warning.interventionAppointments[0].id, appointment: { ...appointmentValues, plannedAt: "2026-07-10 09:00" } } }, "2026-07-08 14:00");
assert(!blockedNoShow.success && appointment.warning.interventionAppointments[0].status === "planned", "grace-period time passage does not write no-show");
const noShow = actions.applyWarningAction(appointment.warning, { type: "mark_intervention_no_show", values: { appointmentId: appointment.warning.interventionAppointments[0].id, appointment: { ...appointmentValues, plannedAt: "2026-07-10 09:00" } } }, "2026-07-08 14:01");
assert(noShow.success && noShow.warning.interventionAppointments.some((item) => item.status === "no_show") && noShow.warning.interventionAppointments[0].status === "planned", "no-show preserves old appointment and creates a new one");
const rescheduledAppointment = actions.applyWarningAction(appointment.warning, { type: "reschedule_intervention", values: { appointmentId: appointment.warning.interventionAppointments[0].id, appointment: { ...appointmentValues, plannedAt: "2026-07-10 11:00" } } }, "2026-07-08 13:30");
assert(rescheduledAppointment.success && rescheduledAppointment.warning.interventionAppointments.some((item) => item.status === "rescheduled"), "reschedule preserves the original appointment");
const cancelledAppointment = actions.applyWarningAction(appointment.warning, { type: "cancel_intervention", values: { appointmentId: appointment.warning.interventionAppointments[0].id, reason: "学生临时请假" } }, "2026-07-08 14:00");
assert(cancelledAppointment.success && cancelledAppointment.warning.interventionAppointments[0].status === "cancelled" && cancelledAppointment.warning.currentStatus === "formal_warning", "cancellation returns to formal warning and preserves the appointment");
assert(appointments.INTERVENTION_CONFIRMATION_GRACE_MINUTES === 60 && appointments.getInterventionAppointmentTiming(appointment.warning.interventionAppointments[0], "2026-07-08 14:00") === "awaiting_result" && appointments.getInterventionAppointmentTiming(appointment.warning.interventionAppointments[0], "2026-07-08 14:01") === "confirmation_required", "intervention grace boundary is exact");
const completedIntervention = actions.applyWarningAction(appointment.warning, { type: "record_intervention_result", values: { appointmentId: appointment.warning.interventionAppointments[0].id, occurredAt: "2026-07-08 14:00", method: "个体访谈", summary: "完成首次干预", judgment: "继续支持", nextPlan: "continue_intervention", nextAppointment: { ...appointmentValues, plannedAt: "2026-07-10 10:00" }, requestFeedback: false } }, "2026-07-08 14:00");
assert(completedIntervention.success && completedIntervention.warning.interventionRecords[0].appointmentId, "intervention result links the completed appointment");
const completedHistory = interventions.buildWarningInterventionHistory({ appointments: completedIntervention.warning.interventionAppointments, records: completedIntervention.warning.interventionRecords });
assert(completedHistory.rounds.some((round) => round.result?.appointmentId === round.appointment.id), "completed intervention is grouped into its appointment round");
assert(completedIntervention.warning.interventionAppointments.filter((item) => item.status === "planned").length === 1, "continue intervention creates the next appointment");
const interventionRetest = actions.applyWarningAction(appointment.warning, { type: "record_intervention_result", values: { appointmentId: appointment.warning.interventionAppointments[0].id, occurredAt: "2026-07-08 14:00", method: "个体访谈", summary: "完成干预", judgment: "进入客观复测", nextPlan: "schedule_retest", requestFeedback: false, retest: { plannedAt: "2026-07-10 10:00", scaleIds: ["phq-9"], scaleNames: ["PHQ-9"], note: "" } } }, "2026-07-08 14:00");
assert(interventionRetest.success && interventionRetest.warning.currentStatus === "pending_retest", "intervention result can enter pending retest");
const interventionReferral = actions.applyWarningAction(appointment.warning, { type: "record_intervention_result", values: { appointmentId: appointment.warning.interventionAppointments[0].id, occurredAt: "2026-07-08 14:00", method: "个体访谈", summary: "完成干预", judgment: "需要外部支持", nextPlan: "referral", requestFeedback: false, referral: { referralType: "医疗转介", organization: "市医院", reason: "需要进一步评估" } } }, "2026-07-08 14:00");
assert(interventionReferral.success && interventionReferral.warning.currentStatus === "referral", "intervention result can enter referral");

const interventionItem = findWarning("WRN-20260707-004");
const noScale = actions.applyWarningAction(interventionItem, { type: "schedule_retest", values: { arrangedAt: currentTime, plannedAt: "2026-07-10 10:00", scaleIds: [], scaleNames: [], note: "" } }, currentTime);
assert(!noScale.success, "retest requires a scale");
const invalidPlan = actions.applyWarningAction(interventionItem, { type: "schedule_retest", values: { arrangedAt: currentTime, plannedAt: currentTime, scaleIds: ["phq-9"], scaleNames: ["PHQ-9"], note: "" } }, currentTime);
assert(!invalidPlan.success, "retest plan must be later than arrangement");
const scheduled = actions.applyWarningAction(interventionItem, { type: "schedule_retest", values: { arrangedAt: currentTime, plannedAt: "2026-07-10 10:00", scaleIds: ["phq-9"], scaleNames: ["PHQ-9"], note: "note" } }, currentTime);
assert(scheduled.success && scheduled.warning.currentStatus === "pending_retest", "retest scheduling changes status");
assert(scheduled.warning.retestRecords[0].scaleNames.length === 1, "retest stores scale");
assert(scheduled.warning.timeline[0].description.includes("PHQ-9"), "retest timeline includes scale");

const referred = actions.applyWarningAction(interventionItem, { type: "start_referral", values: { referralType: "medical", organization: "hospital", reason: "support" } }, currentTime);
assert(referred.success && referred.warning.currentStatus === "referral", "referral transition works");
const referralFollowUp = actions.applyWarningAction(referred.warning, { type: "add_referral_follow_up", values: { occurredAt: "2026-07-08 13:00", authorName: "陈老师", summary: "received", conclusion: "继续跟进" } }, currentTime);
assert(referralFollowUp.success && referralFollowUp.warning.currentStatus === "referral", "referral follow-up keeps referral status");
assert(referralFollowUp.warning.referralRecords[0].followUpRecords.length === 1, "referral follow-up appends a record");
assert(referralFollowUp.warning.retestRecords.length === referred.warning.retestRecords.length, "referral follow-up does not create retest");
const secondFollowUp = actions.applyWarningAction(referralFollowUp.warning, { type: "add_referral_follow_up", values: { occurredAt: "2026-07-08 14:00", authorName: "陈老师", summary: "second", conclusion: "维持转介" } }, currentTime);
assert(secondFollowUp.success && secondFollowUp.warning.referralRecords[0].followUpRecords.length === 2, "referral supports multiple follow-ups");
const duplicateFollowUp = actions.applyWarningAction(secondFollowUp.warning, { type: "add_referral_follow_up", values: { occurredAt: "2026-07-08 14:00", authorName: "陈老师", summary: "second", conclusion: "维持转介" } }, currentTime);
assert(!duplicateFollowUp.success, "duplicate referral follow-up is rejected");

const collaboration = records.buildWarningFeedbackCollaboration(unreadFeedback.feedbackRequests, unreadFeedback.feedbackRecords);
assert(collaboration.rounds.length > 0 && collaboration.proactiveRecords.length > 0, "feedback collaboration separates linked rounds and proactive feedback");
const effectiveTimeline = records.buildEffectiveWarningTimeline(unreadFeedback);
assert(effectiveTimeline.filter((item) => item.id.startsWith("TL-FEEDBACK-")).length === unreadFeedback.feedbackRecords.length, "every feedback record appears once in effective timeline");
assert(effectiveTimeline.every((item, index) => index === 0 || effectiveTimeline[index - 1].occurredAt >= item.occurredAt), "effective timeline is newest first");
assert(effectiveTimeline.filter((item) => item.sourceType === "feedback_request").length === unreadFeedback.feedbackRequests.length, "every feedback request appears once in effective timeline");
assert(effectiveTimeline.filter((item) => item.sourceType === "feedback_request").every((item) => item.description.indexOf("补充反馈要求：") < item.description.indexOf("反馈截止时间：")), "feedback request timeline uses the frozen field labels and order");
const interventionTimeline = records.buildEffectiveWarningTimeline(findWarning("WRN-20260707-004"));
assert(interventionTimeline.filter((item) => item.sourceType === "intervention_record").length === findWarning("WRN-20260707-004").interventionRecords.length, "intervention records drive timeline events");
const twoRetests = findWarning("WRN-20260704-007");
assert(records.buildEffectiveWarningTimeline(twoRetests).filter((item) => item.sourceType === "retest_record").length >= twoRetests.retestRecords.length, "multiple retests keep separate timeline events");
assert(retests.getLatestCompletedRetest(twoRetests)?.completedAt, "latest completed retest is selected independently");

const completedRetest = findWarning("WRN-20260708-009");
const closed = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "close" } }, currentTime);
const continued = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "continue_intervention" } }, currentTime);
const retestReferral = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "referral" } }, currentTime);
assert(closed.success && closed.warning.currentStatus === "closed", "retest can close");
assert(continued.success && continued.warning.currentStatus === "in_intervention", "retest can continue intervention");
assert(retestReferral.success && retestReferral.warning.currentStatus === "referral", "retest can refer");
assert(types.getEffectiveRiskLevel(confirmed) === "medium", "effective risk uses confirmation");
assert(mock.warningMockData.flatMap((item) => item.retestRecords).filter((item) => item.completedAt).every((item) => item.assessmentRecordId), "completed retests link complete assessment responses");
assert(mock.warningMockData.flatMap((item) => item.referralRecords).flatMap((item) => item.followUpRecords).every((item) => item.conclusion), "referral follow-ups include professional conclusions");

const businessDialogLayoutSource = readFileSync("src/components/warning/BusinessDialogLayout.ts", "utf8");
const actionDialogSource = readFileSync("src/components/warning/WarningActionDialog.tsx", "utf8");
const confirmDialogSource = readFileSync("src/components/warning/ConfirmFormalWarningDialog.tsx", "utf8");
const interventionViewSource = readFileSync("src/components/case-records/InterventionHistoryView.tsx", "utf8");
assert(businessDialogLayoutSource.includes("max-h-[calc(100dvh-64px)]") && businessDialogLayoutSource.includes("overflow-y-auto"), "business dialogs share viewport-safe height and a middle scroll body");
assert(actionDialogSource.includes("BUSINESS_DIALOG_HEADER_CLASS") && actionDialogSource.includes("BUSINESS_DIALOG_FOOTER_CLASS") && confirmDialogSource.includes("BUSINESS_DIALOG_BODY_CLASS"), "business action dialogs share fixed header, body, and footer layout tokens");
assert(["实际干预时间", "干预方式", "情况摘要", "本次判断", "下一步计划", "记录人"].every((label) => interventionViewSource.includes(label)), "intervention rounds render every latest result field");
assert(interventionViewSource.includes("尚未记录本次干预结果") && interventionViewSource.includes("未关联历史记录"), "intervention rounds cover pending and unlinked records");

console.log(`warning regression assertions: ${assertionCount} passed`);
