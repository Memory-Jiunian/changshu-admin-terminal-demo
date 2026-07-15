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

const warningTypesUrl = moduleUrl(compile("src/types/warning.ts"));
const workbenchTypesUrl = moduleUrl(
  compile("src/types/workbench.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const feedbackUrl = moduleUrl(
  compile("src/lib/warning-feedback.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const tasksUrl = moduleUrl(
  compile("src/lib/workbench-tasks.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/types/workbench"', `"${workbenchTypesUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`),
);
const navigationUrl = moduleUrl(
  compile("src/lib/workbench-navigation.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/types/workbench"', `"${workbenchTypesUrl}"`),
);
const [workbenchTypes, tasks, navigation, mock] = await Promise.all([
  import(workbenchTypesUrl),
  import(tasksUrl),
  import(navigationUrl),
  import(moduleUrl(compile("src/data/warningMock.ts"))),
]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}

const currentTime = "2026-07-08 12:00";
const template = structuredClone(mock.warningMockData[0]);
function fixture(id, overrides = {}) {
  return {
    ...structuredClone(template),
    id,
    studentId: `STU-${id}`,
    isActive: true,
    responsibleTeacher: "陈老师",
    currentStatus: "pending_review",
    activityTime: "2026-07-08 08:00",
    feedbackRecords: [],
    feedbackRequests: [],
    hasUnreadFeedback: false,
    feedbackDeadline: undefined,
    retestRecords: [],
    referralRecords: [],
    ...overrides,
  };
}

const feedbackRecord = structuredClone(mock.warningMockData.find((item) => item.feedbackRecords.length)?.feedbackRecords[0]);
const referralRecord = structuredClone(mock.warningMockData.find((item) => item.referralRecords.length)?.referralRecords[0]);
const fixtures = [
  fixture("WRN-WB-001"),
  fixture("WRN-WB-002", { currentStatus: "observing", nextReviewAt: "2026-07-08 10:00", suggestedRiskLevel: "high" }),
  fixture("WRN-WB-003", { currentStatus: "formal_warning", feedbackRecords: [feedbackRecord], hasUnreadFeedback: true }),
  fixture("WRN-WB-004", { currentStatus: "formal_warning", feedbackDeadline: "2026-07-07 17:00" }),
  fixture("WRN-WB-005", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-1", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 09:00", completedAt: "2026-07-08 10:00", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
  fixture("WRN-WB-006", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-2", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 15:00", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
  fixture("WRN-WB-007", { currentStatus: "referral", referralRecords: [{ ...referralRecord, followUpRecords: [{ id: "RFU-1", occurredAt: "2026-07-07 11:00", recordedBy: "陈老师", summary: "已联系机构" }] }] }),
  fixture("WRN-WB-008", { responsibleTeacher: "周老师" }),
  fixture("WRN-WB-009", { isActive: false }),
  fixture("WRN-WB-010", { currentStatus: "closed" }),
];

const result = tasks.buildWorkbenchItems({ warnings: fixtures, currentTeacher: "陈老师", currentTime });
assert(result.tasks.length === 6, "six active task types are derived");
assert(new Set(result.tasks.map((item) => item.type)).size === 6, "each active task type is covered");
assert(result.reminders.length === 1 && result.reminders[0].type === "retest_plan_today", "one reminder type is derived separately");
assert(result.tasks.every((item) => item.responsibleTeacher === "陈老师"), "other teachers are filtered");
assert(!result.tasks.some((item) => item.warningId === "WRN-WB-009" || item.warningId === "WRN-WB-010"), "inactive and closed warnings are filtered");
assert(!result.tasks.some((item) => item.warningId === "WRN-WB-006"), "today incomplete retest is reminder only");
assert(result.tasks.find((item) => item.warningId === "WRN-WB-003")?.type === "new_feedback", "new feedback wins over overdue status");
assert(result.tasks.find((item) => item.type === "referral_follow_up")?.isOverdue === false, "referral follow-up is never overdue");
assert(result.tasks.every((item) => item.id === `${item.warningId}:${item.type}`), "task IDs are stable");
assert(result.reminders[0].id === `${result.reminders[0].warningId}:retest_plan_today`, "reminder ID is stable");
assert(result.tasks[0].isOverdue, "overdue task sorts first");
assert(workbenchTypes.workbenchTaskSections.pending_review === "risk_evidence", "pending review targets evidence");
assert(workbenchTypes.workbenchTaskSections.observation_due === "action_bar", "observation due targets action bar");
assert(workbenchTypes.workbenchTaskSections.new_feedback === "feedback", "new feedback targets feedback");
assert(workbenchTypes.workbenchTaskSections.feedback_overdue === "feedback", "feedback overdue targets feedback");
assert(workbenchTypes.workbenchTaskSections.retest_result_pending === "retest", "retest result targets retest");
assert(workbenchTypes.workbenchTaskSections.referral_follow_up === "referral", "referral targets referral");
assert(workbenchTypes.warningDetailSections.length === 6, "six centralized detail section values exist");

const unread = fixtures[2];
const intent = { source: "workbench", warningId: unread.id, studentId: unread.studentId, taskType: "new_feedback", targetSection: "feedback" };
assert(navigation.canMarkWorkbenchFeedbackRead({ intent, warning: unread, renderedSection: "feedback" }), "matching rendered feedback permits read");
assert(!navigation.canMarkWorkbenchFeedbackRead({ warning: unread, renderedSection: "feedback" }), "ordinary warning entry cannot mark read");
assert(!navigation.canMarkWorkbenchFeedbackRead({ intent: { ...intent, warningId: "WRN-OTHER" }, warning: unread, renderedSection: "feedback" }), "mismatched warning cannot mark read");
assert(!navigation.canMarkWorkbenchFeedbackRead({ intent, warning: unread, renderedSection: "overview" }), "unrendered feedback cannot mark read");
const readWarning = navigation.markWarningFeedbackRead(unread);
assert(!readWarning.hasUnreadFeedback, "successful read clears item-level unread flag");
assert(readWarning.feedbackRecords === unread.feedbackRecords, "read preserves feedback records");
assert(readWarning.timeline === unread.timeline, "read does not append business timeline");
const afterRead = tasks.buildWorkbenchItems({
  warnings: fixtures.map((warning) => warning.id === readWarning.id ? readWarning : warning),
  currentTeacher: "陈老师",
  currentTime,
});
assert(!afterRead.tasks.some((task) => task.id === `${readWarning.id}:new_feedback`), "new feedback task disappears after selector re-derives read state");

const detailSource = readFileSync("src/components/warning/WarningDetailContent.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const sidebarSource = readFileSync("src/components/layout/Sidebar.tsx", "utf8");
assert(workbenchTypes.warningDetailSections.every((section) => detailSource.includes(`data-warning-section=\"${section}\"`)), "all six anchors are attached to real detail DOM");
assert(detailSource.includes("requestAnimationFrame") && detailSource.includes("scrollIntoView"), "targeting waits for render frame and scrolls real DOM");
assert(detailSource.includes("requestedTarget ?? overviewTarget"), "missing target safely falls back to overview");
assert(detailSource.includes("consumedTargetRef"), "a navigation target is consumed once");
assert(appSource.includes('useState<AppPage>("workbench")'), "workbench is the default app entry");
assert(sidebarSource.includes('page: "workbench"'), "sidebar links to the real workbench");
assert(appSource.includes("PlaceholderPage title=\"校级总览\"") && appSource.includes("PlaceholderPage title=\"系统设置\""), "unimplemented pages use explicit placeholders");

console.log(`Workbench regression assertions passed: ${assertionCount}`);
