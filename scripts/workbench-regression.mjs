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
const appointmentsUrl = moduleUrl(compile("src/lib/intervention-appointments.ts"));
const retestsUrl = moduleUrl(compile("src/lib/warning-retests.ts"));
const tasksUrl = moduleUrl(
  compile("src/lib/workbench-tasks.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/types/workbench"', `"${workbenchTypesUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`)
    .replaceAll('"@/lib/intervention-appointments"', `"${appointmentsUrl}"`)
    .replaceAll('"@/lib/warning-retests"', `"${retestsUrl}"`),
);
const navigationUrl = moduleUrl(
  compile("src/lib/workbench-navigation.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/types/workbench"', `"${workbenchTypesUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`),
);
const [workbenchTypes, feedback, tasks, navigation, mock] = await Promise.all([
  import(workbenchTypesUrl),
  import(feedbackUrl),
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
    interventionAppointments: [],
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
  fixture("WRN-WB-004", { currentStatus: "formal_warning", feedbackDeadline: "2026-07-07 17:00", feedbackRequests: [{ id: "FQ-4", requestedAt: "2026-07-06 10:00", requestedBy: "陈老师", requestNote: "观察", deadline: "2026-07-07 17:00", status: "overdue" }] }),
  fixture("WRN-WB-005", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-1", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 09:00", completedAt: "2026-07-08 10:00", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
  fixture("WRN-WB-006", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-2", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 15:00", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
  fixture("WRN-WB-007", { currentStatus: "referral", referralRecords: [{ ...referralRecord, followUpRecords: [{ id: "RFU-1", occurredAt: "2026-07-07 11:00", authorName: "陈老师", summary: "已联系机构", conclusion: "继续跟进" }] }] }),
  fixture("WRN-WB-008", { responsibleTeacher: "周老师" }),
  fixture("WRN-WB-009", { isActive: false }),
  fixture("WRN-WB-010", { currentStatus: "closed" }),
  fixture("WRN-WB-011", { currentStatus: "formal_warning" }),
  fixture("WRN-WB-012", { currentStatus: "in_intervention", interventionAppointments: [{ id: "IA-12", plannedAt: "2026-07-07 15:00", location: "心理咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-06 10:00", createdBy: "陈老师", notificationOffsetsMinutes: [1440, 120] }] }),
  fixture("WRN-WB-013", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-3", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-07 15:00", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
  fixture("WRN-WB-014", { currentStatus: "in_intervention", interventionAppointments: [{ id: "IA-14", plannedAt: "2026-07-09 10:00", location: "心理咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-08 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [1440, 120] }] }),
  fixture("WRN-WB-015", { currentStatus: "in_intervention", interventionAppointments: [{ id: "IA-15", plannedAt: "2026-07-08 11:30", location: "心理咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-08 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [1440, 120] }] }),
  fixture("WRN-WB-016", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-4", arrangedAt: "2026-07-08 08:00", plannedAt: "2026-07-08 10:30", scaleIds: ["S-1"], scaleNames: ["量表一"], note: "" }] }),
];

const result = tasks.buildWorkbenchItems({ warnings: fixtures, currentTeacher: "陈老师", currentTime });
assert(new Set(result.tasks.map((item) => item.type)).size === 7, "all seven active task types are derived");
assert(new Set(result.reminders.map((item) => item.type)).size === 2, "retest and intervention reminder types are derived separately");
assert(new Set(result.reminders.map((item) => item.state)).size === 3, "arrangements cover upcoming, intervention confirmation, and incomplete retest states");
assert(result.tasks.every((item) => item.responsibleTeacher === "陈老师"), "other teachers are filtered");
assert(!result.tasks.some((item) => item.warningId === "WRN-WB-009" || item.warningId === "WRN-WB-010"), "inactive and closed warnings are filtered");
assert(!result.tasks.some((item) => item.warningId === "WRN-WB-006"), "today incomplete retest is reminder only");
assert(!result.tasks.some((item) => ["intervention_status_pending", "retest_status_pending"].includes(item.type)), "arrangement attention is not exposed as task tabs");
assert(result.tasks.find((item) => item.warningId === "WRN-WB-003")?.type === "new_feedback", "new feedback wins over overdue status");
assert(result.tasks.find((item) => item.type === "referral_follow_up")?.isOverdue === false, "referral follow-up is never overdue");
assert(fixtures.find((item) => item.id === "WRN-WB-012").interventionAppointments[0].status === "planned", "overdue appointment derivation never auto-marks no-show");
assert(result.reminders.find((item) => item.warningId === "WRN-WB-012")?.state === "intervention_confirmation_required", "intervention after one-hour grace requires confirmation");
assert(result.reminders.find((item) => item.warningId === "WRN-WB-015")?.state === "upcoming", "intervention inside one-hour grace remains an arrangement");
assert(result.reminders.find((item) => item.warningId === "WRN-WB-013")?.state === "retest_incomplete", "retest after two-hour grace is incomplete");
assert(result.reminders.find((item) => item.warningId === "WRN-WB-016")?.state === "upcoming", "retest inside two-hour grace remains an arrangement");
assert(result.reminders.every((reminder) => !result.tasks.some((task) => task.id === reminder.id)), "reminders remain outside active task totals");
assert(result.tasks.every((item) => item.id === `${item.warningId}:${item.type}`), "task IDs are stable");
assert(result.reminders.every((item) => item.id === `${item.warningId}:${item.type}`), "reminder IDs are stable");
assert(result.tasks[0].isOverdue, "overdue task sorts first");
assert(workbenchTypes.workbenchTaskSections.pending_review === "risk_evidence", "pending review targets evidence");
assert(workbenchTypes.workbenchTaskSections.observation_due === "action_bar", "observation due targets action bar");
assert(workbenchTypes.workbenchTaskSections.new_feedback === "feedback", "new feedback targets feedback");
assert(workbenchTypes.workbenchTaskSections.feedback_overdue === "feedback", "feedback overdue targets feedback");
assert(workbenchTypes.workbenchTaskSections.retest_result_pending === "retest", "retest result targets retest");
assert(workbenchTypes.workbenchTaskSections.referral_follow_up === "referral", "referral targets referral");
assert(!("intervention_status_pending" in workbenchTypes.workbenchTaskSections) && !("retest_status_pending" in workbenchTypes.workbenchTaskSections), "arrangement attention types are removed from task mapping");
assert(workbenchTypes.warningDetailSections.length === 7, "seven centralized detail section values exist");

const sharedMockResult = tasks.buildWorkbenchItems({ warnings: mock.warningMockData, currentTeacher: "陈老师", currentTime });
assert(sharedMockResult.tasks.every((task) => task.responsibleTeacher === "陈老师"), "shared workbench never includes another teacher's warnings");
assert(sharedMockResult.tasks.some((task) => task.type === "intervention_unscheduled"), "shared mock covers the current teacher's unscheduled intervention");
assert(sharedMockResult.reminders.some((reminder) => reminder.type === "retest_plan_today"), "shared mock visibly covers today's retest reminder");
assert(sharedMockResult.reminders.some((reminder) => reminder.type === "intervention_plan_upcoming"), "shared mock visibly covers an intervention reminder");
assert(sharedMockResult.reminders.every((reminder) => ["retest", "intervention"].includes(reminder.targetSection)), "reminders target their real record sections");
const sharedMockSnapshot = JSON.stringify(mock.warningMockData);
tasks.buildWorkbenchItems({ warnings: mock.warningMockData, currentTeacher: "陈老师", currentTime });
assert(JSON.stringify(mock.warningMockData) === sharedMockSnapshot, "viewing and deriving reminders does not mutate shared warnings");

const unread = fixtures[2];
const intent = { source: "workbench", warningId: unread.id, studentId: unread.studentId, taskType: "new_feedback", targetSection: "feedback" };
assert(navigation.shouldProtectWorkbenchFeedbackClose({ intent, warning: unread }), "workbench unread-feedback origin enables close protection");
assert(!navigation.shouldProtectWorkbenchFeedbackClose({ warning: unread }), "ordinary warning entry does not enable close protection");
assert(!navigation.shouldProtectWorkbenchFeedbackClose({ intent: { ...intent, warningId: "WRN-OTHER" }, warning: unread }), "mismatched warning does not enable close protection");
assert(!navigation.shouldProtectWorkbenchFeedbackClose({ intent: { ...intent, taskType: "feedback_overdue" }, warning: unread }), "other workbench task does not enable close protection");
const timelineBeforeRead = unread.timeline;
const feedbackBeforeRead = unread.feedbackRecords;
const readWarning = feedback.markWarningFeedbackRead({ warning: unread, readAt: currentTime });
assert(!readWarning.hasUnreadFeedback, "successful read clears item-level unread flag");
assert(readWarning.feedbackRecords.length === feedbackBeforeRead.length, "read preserves feedback records");
assert(readWarning.feedbackRecords.every((record) => record.psychologistReadAt === currentTime), "read stamps every currently unread feedback record");
assert(readWarning.timeline === timelineBeforeRead, "read does not append business timeline");
assert(!navigation.shouldProtectWorkbenchFeedbackClose({ intent, warning: readWarning }), "read feedback closes without protection");
assert(feedback.hasUnreadWarningFeedback(unread), "rendering input remains unread before explicit action");
const mixedReadWarning = { ...unread, feedbackRecords: [{ ...unread.feedbackRecords[0], psychologistReadAt: currentTime }, { ...unread.feedbackRecords[0], id: "FB-UNREAD-2", psychologistReadAt: undefined }] };
assert(feedback.hasUnreadWarningFeedback(mixedReadWarning), "one unread record keeps the item in new-feedback state");
const afterRead = tasks.buildWorkbenchItems({
  warnings: fixtures.map((warning) => warning.id === readWarning.id ? readWarning : warning),
  currentTeacher: "陈老师",
  currentTime,
});
assert(!afterRead.tasks.some((task) => task.id === `${readWarning.id}:new_feedback`), "new feedback task disappears after selector re-derives read state");

const detailSource = readFileSync("src/components/warning/WarningDetailContent.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const sidebarSource = readFileSync("src/components/layout/Sidebar.tsx", "utf8");
const feedbackPanelSource = readFileSync("src/components/warning/FeedbackPanel.tsx", "utf8");
const warningPageSource = readFileSync("src/components/warning/WarningManagementPage.tsx", "utf8");
const workbenchPageSource = readFileSync("src/components/workbench/WorkbenchPage.tsx", "utf8");
const reminderSource = readFileSync("src/components/workbench/WorkbenchReminderList.tsx", "utf8");
const taskTabsSource = readFileSync("src/components/workbench/WorkbenchTaskTypeTabs.tsx", "utf8");
const appShellSource = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const taskSelectorSource = readFileSync("src/lib/workbench-tasks.ts", "utf8");
const closeDialogSource = readFileSync("src/components/warning/UnreadFeedbackCloseDialog.tsx", "utf8");
assert(workbenchTypes.warningDetailSections.every((section) => detailSource.includes(`data-warning-section=\"${section}\"`)), "all seven anchors are attached to real detail DOM");
assert(detailSource.includes("requestAnimationFrame") && detailSource.includes("scrollIntoView"), "targeting waits for render frame and scrolls real DOM");
assert(detailSource.includes("requestedTarget ?? overviewTarget"), "missing target safely falls back to overview");
assert(detailSource.includes("consumedTargetRef"), "a navigation target is consumed once");
assert(appSource.includes('useState<AppPage>("workbench")'), "workbench is the default app entry");
assert(sidebarSource.includes('page: "workbench"'), "sidebar links to the real workbench");
assert(appSource.includes("PlaceholderPage title=\"校级总览\"") && appSource.includes("PlaceholderPage title=\"系统设置\""), "unimplemented pages use explicit placeholders");
assert(feedbackPanelSource.includes("标记为已查看"), "feedback module exposes explicit read confirmation");
assert(!warningPageSource.includes("canMarkWorkbenchFeedbackRead"), "navigation rendering no longer marks feedback read automatically");
assert(reminderSource.includes("item.ctaLabel") && taskSelectorSource.includes('ctaLabel: "查看安排"') && taskSelectorSource.includes('ctaLabel: "确认干预情况"') && taskSelectorSource.includes('ctaLabel: "查看并重新安排"'), "arrangements use the approved dynamic labels");
assert(closeDialogSource.includes("关闭并保留待办") && closeDialogSource.includes("标记已查看并关闭"), "close guard provides all protected choices");
assert(workbenchPageSource.includes("min-[1180px]:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]"), "workbench uses the approved responsive 70/30 grid");
assert(workbenchPageSource.indexOf("<WorkbenchSummary") < workbenchPageSource.indexOf("min-[1180px]:grid-cols"), "summary remains full width above the content grid");
assert(reminderSource.includes("min-[1180px]:overflow-y-auto") && reminderSource.includes("scrollbar-hidden"), "arrangements use one hidden-scroll desktop list body");
assert(taskTabsSource.includes("flex-nowrap") && taskTabsSource.includes("overflow-x-auto") && taskTabsSource.includes("scrollbar-hidden"), "task tabs stay on one horizontally scrollable row without a visible track");
assert(appShellSource.includes("grid-cols-[64px_minmax(0,1fr)]") && appShellSource.includes("grid-cols-[152px_minmax(0,1fr)]"), "App Shell owns the expanded and collapsed sidebar column widths");
assert(sidebarSource.includes("TooltipContent") && sidebarSource.includes("aria-current"), "collapsed navigation retains tooltips and selected-page semantics");
assert(appShellSource.includes("sidebarCollapsed") && appShellSource.includes("setSidebarCollapsed"), "sidebar collapse is isolated to shell UI state");
assert(!workbenchPageSource.includes('return <section className="mx-auto flex') && workbenchPageSource.includes('grid h-full min-h-0 w-full'), "ready workbench fills the App Shell without centered max-width gaps");
assert(workbenchPageSource.includes("min-[1180px]:grid-rows-[auto_auto_minmax(0,1fr)]") && workbenchPageSource.includes("min-[1180px]:overflow-hidden"), "desktop workbench uses a viewport-filling non-scrolling page grid");
assert(workbenchPageSource.includes('aria-label="当前待办列表"') && reminderSource.includes('aria-label="今日及近期安排列表"'), "desktop columns expose one focusable list body each");
assert(taskSelectorSource.includes("事项已形成正式预警，尚未安排干预。") && !taskSelectorSource.includes("首次干预"), "unscheduled intervention copy no longer says first intervention");

console.log(`Workbench regression assertions passed: ${assertionCount}`);
