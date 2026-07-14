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
const actionsCode = compile("src/lib/warning-actions.ts")
  .replaceAll('"@/types/warning"', `"${typesUrl}"`)
  .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`);
const [types, feedback, actions, mock] = await Promise.all([
  import(typesUrl),
  import(feedbackUrl),
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

const pendingFeedback = findWarning("WRN-20260708-003");
const overdueFeedback = findWarning("WRN-20260708-012");
const receivedFeedback = findWarning("WRN-20260703-008");
const unreadFeedback = findWarning("WRN-20260707-004");
assert(feedback.getEffectiveFeedbackStatus(pendingFeedback, currentTime) === "pending_feedback", "pending feedback derives from deadline");
assert(feedback.getEffectiveFeedbackStatus(overdueFeedback, currentTime) === "feedback_overdue", "overdue feedback derives from deadline");
assert(feedback.getEffectiveFeedbackStatus(receivedFeedback, currentTime) === "feedback_received", "read feedback is received");
assert(feedback.getEffectiveFeedbackStatus(unreadFeedback, currentTime) === "new_feedback", "unread feedback is new");
assert(feedback.getFeedbackActionAvailability(pendingFeedback, currentTime).kind === "waiting", "pending task blocks duplicate request");
assert(feedback.getFeedbackActionAvailability(overdueFeedback, currentTime).kind === "rerequest", "overdue task allows re-request");
assert(feedback.getFeedbackActionAvailability(receivedFeedback, currentTime).kind === "hidden", "received feedback hides request");

const blockedRequest = actions.applyWarningAction(pendingFeedback, { type: "request_feedback", values: { feedbackRequestNote: "note", feedbackDeadline: "2026-07-10 10:00" } }, currentTime);
assert(!blockedRequest.success, "service blocks duplicate in-progress request");
const rerequest = actions.applyWarningAction(overdueFeedback, { type: "request_feedback", values: { feedbackRequestNote: "note", feedbackDeadline: "2026-07-10 10:00" } }, currentTime);
assert(rerequest.success, "overdue feedback can be requested again");
assert(rerequest.warning.feedbackStatus === "pending_feedback", "re-request returns to pending");
assert(rerequest.warning.feedbackRequests.length === overdueFeedback.feedbackRequests.length + 1, "re-request preserves request history");
assert(rerequest.warning.timeline[0].title === "重新请求反馈", "re-request writes the correct timeline event");

const review = findWarning("WRN-20260708-001");
const confirmed = actions.applyConfirmFormalWarning(review, { confirmedRiskLevel: "medium", judgmentNote: "note", riskLevelAdjustmentReason: "reason", feedbackRequestNote: "observe attendance", feedbackDeadline: "2026-07-10 17:00" }, currentTime);
assert(confirmed.currentStatus === "formal_warning", "confirmation changes main status");
assert(confirmed.confirmedRiskLevel === "medium", "confirmation stores risk");
assert(confirmed.feedbackDeadline === "2026-07-10 17:00", "confirmation stores deadline");
assert(confirmed.feedbackRequests.length === 1, "confirmation creates first request");
assert(confirmed.timeline[0].description.includes("observe attendance"), "confirmation timeline includes request");

const observed = actions.applyWarningAction(review, { type: "continue_observation", values: { observationNote: "observe", nextReviewAt: "2026-07-10 10:00" } }, currentTime);
assert(observed.success && observed.warning.currentStatus === "observing", "observation transition works");
const ended = actions.applyWarningAction(review, { type: "end_review", values: { endReason: "resolved" } }, currentTime);
assert(ended.success && !ended.warning.isActive && ended.warning.disposition === "ended_without_warning", "end review removes active item without a new status");
const intervention = actions.applyWarningAction(receivedFeedback, { type: "record_intervention", values: { occurredAt: currentTime, method: "talk", summary: "summary", judgment: "judgment", followUpPlan: "plan" } }, currentTime);
assert(intervention.success && intervention.warning.currentStatus === "in_intervention", "intervention changes status");
assert(intervention.warning.interventionRecords.length === receivedFeedback.interventionRecords.length + 1, "intervention appends a record");

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
const referralResult = actions.applyWarningAction(referred.warning, { type: "record_referral_result", values: { resultRecordedAt: "2026-07-08 13:00", resultSummary: "received" } }, currentTime);
assert(referralResult.success && referralResult.warning.currentStatus === "referral", "referral result keeps referral status");
assert(referralResult.warning.retestRecords.length === referred.warning.retestRecords.length, "referral result does not create retest");

const completedRetest = findWarning("WRN-20260708-009");
const closed = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "close" } }, currentTime);
const continued = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "continue_intervention" } }, currentTime);
const retestReferral = actions.applyWarningAction(completedRetest, { type: "update_retest_status", values: { outcome: "referral" } }, currentTime);
assert(closed.success && closed.warning.currentStatus === "closed", "retest can close");
assert(continued.success && continued.warning.currentStatus === "in_intervention", "retest can continue intervention");
assert(retestReferral.success && retestReferral.warning.currentStatus === "referral", "retest can refer");
assert(types.getEffectiveRiskLevel(confirmed) === "medium", "effective risk uses confirmation");

console.log(`warning regression assertions: ${assertionCount} passed`);
