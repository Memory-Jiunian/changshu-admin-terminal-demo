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
const studentTypesUrl = moduleUrl(
  compile("src/types/studentProfile.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const assessmentTypesUrl = moduleUrl(compile("src/types/assessment.ts"));
const overviewTypesUrl = moduleUrl(
  compile("src/types/school-overview.ts")
    .replaceAll('"@/types/studentProfile"', `"${studentTypesUrl}"`)
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const appointmentsUrl = moduleUrl(compile("src/lib/intervention-appointments.ts"));
const retestsUrl = moduleUrl(
  compile("src/lib/warning-retests.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const feedbackUrl = moduleUrl(
  compile("src/lib/warning-feedback.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const selectorUrl = moduleUrl(
  compile("src/lib/school-overview.ts")
    .replaceAll('"@/lib/intervention-appointments"', `"${appointmentsUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`)
    .replaceAll('"@/lib/warning-retests"', `"${retestsUrl}"`)
    .replaceAll('"@/types/assessment"', `"${assessmentTypesUrl}"`)
    .replaceAll('"@/types/studentProfile"', `"${studentTypesUrl}"`)
    .replaceAll('"@/types/school-overview"', `"${overviewTypesUrl}"`)
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const studentMockUrl = moduleUrl(compile("src/data/studentProfileMock.ts"));
const assessmentMockUrl = moduleUrl(
  compile("src/data/assessmentMock.ts")
    .replaceAll('"@/data/studentProfileMock"', `"${studentMockUrl}"`)
    .replaceAll('"@/types/assessment"', `"${assessmentTypesUrl}"`)
    .replaceAll('"@/types/school-overview"', `"${overviewTypesUrl}"`),
);

const [selector, mock, studentMock, assessmentMock] = await Promise.all([
  import(selectorUrl),
  import(moduleUrl(compile("src/data/warningMock.ts"))),
  import(studentMockUrl),
  import(assessmentMockUrl),
]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}

const currentTime = "2026-07-08 12:00";
const termRange = { label: "2025-2026 学年第二学期", start: "2026-02-16 00:00", end: "2026-07-15 23:59" };
const template = structuredClone(mock.warningMockData[0]);

function student(id, grade, className, enrollmentStatus = "enrolled") {
  return {
    studentId: id,
    studentName: `学生${id}`,
    studentNumber: id,
    currentGrade: grade,
    currentClass: className,
    currentHeadTeacher: "王老师",
    enrollmentStatus,
    updatedAt: currentTime,
    enrollmentHistory: [],
    warningCaseIds: [],
  };
}

function warning(id, studentId, overrides = {}) {
  return {
    ...structuredClone(template),
    id,
    studentId,
    studentName: `学生${studentId}`,
    gradeClass: "初一（1）班",
    isActive: true,
    currentStatus: "formal_warning",
    suggestedRiskLevel: "medium",
    confirmedRiskLevel: "medium",
    responsibleTeacher: "陈老师",
    activityTime: "2026-07-08 10:00",
    feedbackRecords: [],
    feedbackRequests: [],
    interventionAppointments: [],
    interventionRecords: [],
    retestRecords: [],
    referralRecords: [],
    timeline: [{ id: `${id}-FORMAL`, title: "确认正式预警", operator: "陈老师", occurredAt: "2026-03-10 10:00", description: "已确认。" }],
    ...overrides,
  };
}

function assessment(id, studentId, completedAt, overrides = {}) {
  return {
    id,
    studentId,
    scaleId: "SCL-1",
    scaleName: "普筛量表",
    startedAt: completedAt ?? "2026-07-01 09:00",
    completedAt,
    status: completedAt ? "completed" : "incomplete",
    isValid: Boolean(completedAt),
    ...overrides,
  };
}

const students = [
  student("S1", "初一", "1班"),
  student("S2", "初一", "1班"),
  student("S3", "初一", "2班"),
  student("S4", "初一", "2班"),
  student("S5", "初一", "2班"),
  student("S6", "初二", "1班"),
  student("S7", "初二", "2班"),
  student("S8", "初二", "2班", "left_school"),
];
const assessments = [
  assessment("A1", "S1", "2026-03-01 09:30"),
  assessment("A1B", "S1", "2026-06-01 09:30"),
  assessment("A2", "S2", undefined),
  assessment("A3", "S3", "2026-04-01 09:30"),
  assessment("A4", "S8", "2026-05-01 09:30"),
  assessment("A5", "S4", "2026-01-01 09:30"),
];

const warnings = [
  warning("W1", "S1", { confirmedRiskLevel: "high", sourceType: "screening_abnormal", responsibleTeacher: "周老师" }),
  warning("W2", "S2", { confirmedRiskLevel: "critical", sourceType: "ai_chat_trigger", timeline: [{ id: "W2-F", title: "确认正式预警", operator: "刘老师", occurredAt: "2026-04-10 10:00", description: "已确认。" }] }),
  warning("W3", "S3", { sourceType: "teacher_report", timeline: [{ id: "W3-F", title: "确认正式预警", operator: "陈老师", occurredAt: "2026-05-10 10:00", description: "已确认。" }] }),
  warning("W4", "S4", { confirmedRiskLevel: "high", sourceType: "screening_abnormal", currentStatus: "in_intervention", interventionAppointments: [{ id: "IA-4", plannedAt: "2026-07-08 09:00", location: "咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-01 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [1440, 120] }] }),
  warning("W5", "S5", { currentStatus: "referral", sourceType: "ai_chat_trigger", referralRecords: [{ id: "REF-5", referredAt: "2026-05-12 10:00", referralType: "医疗", reason: "持续关注", followUpRecords: [{ id: "FU-5", occurredAt: "2026-06-01 10:00", authorName: "陈老师", summary: "已联系", conclusion: "继续跟进" }] }] }),
  warning("W6", "S6", { confirmedRiskLevel: undefined, currentStatus: "pending_review", sourceType: "teacher_report" }),
  warning("W7", "S7", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-7", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 08:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] }),
  warning("W8", "S7", { isActive: false, currentStatus: "closed", endedAt: "2026-04-20 10:00", timeline: [{ id: "W8-C", title: "完成闭环归档", operator: "陈老师", occurredAt: "2026-04-20 10:00", description: "已闭环。" }] }),
  warning("W9", "S6", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-9", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 09:00", completedAt: "2026-07-08 10:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] }),
  warning("W10", "S6", { confirmedRiskLevel: undefined, feedbackRequests: [{ id: "FR-10", requestedAt: "2026-07-01 09:00", requestedBy: "陈老师", requestNote: "请反馈", deadline: "2026-07-07 17:00", status: "pending" }] }),
  warning("W11", "S4", { activityTime: "2026-07-08 11:00", confirmedRiskLevel: "high" }),
  warning("W12", "S8", { isActive: false, currentStatus: "closed", endedAt: "2026-06-20 10:00" }),
];

const input = { students, assessments, warnings, currentTime, termRange, organizationFilter: { level: "school" } };
const snapshot = JSON.stringify(input);
const overview = selector.buildSchoolOverview(input);

assert(overview.coverage.enrolledCount === 7, "coverage excludes left-school students");
assert(overview.coverage.completedCount === 2, "coverage deduplicates students and excludes outside-term assessments");
assert(overview.coverage.incompleteCount === 5, "coverage exposes the enrolled incomplete count");
assert(overview.currentRisk.studentCount === 6, "current confirmed risk counts students, not cases");
assert(overview.currentRisk.highCount === 2 && overview.currentRisk.criticalCount === 1, "high and critical student counts use confirmed levels");
assert(!overview.riskLevelDistribution.some((item) => item.id === "low"), "active risk distribution never includes low");
assert(!overview.currentRisk.studentCount.toString().includes("S"), "current risk exposes no identity");
assert(overview.dataIssues.some((issue) => issue.code === "multiple_active_cases"), "multiple active cases are reported");
assert(overview.dataIssues.some((issue) => issue.code === "missing_confirmed_risk"), "missing confirmed risk is reported for later statuses");
assert(overview.dispositionDistribution.active.find((item) => item.id === "in_intervention")?.label === "待干预", "in_intervention is presented as pending intervention");
assert(overview.dispositionDistribution.closedThisTermCount === 2, "closed cases use a separate current-term case count");
assert(overview.attention.find((item) => item.id === "intervention_unscheduled")?.value >= 1, "unscheduled intervention derives from formal warnings without planned appointments");
assert(overview.attention.find((item) => item.id === "intervention_confirmation_required")?.value === 1, "appointment after 60-minute grace requires confirmation");
assert(warnings.find((item) => item.id === "W4").interventionAppointments[0].status === "planned", "overview derivation never auto-marks no-show");
assert(overview.attention.find((item) => item.id === "feedback_overdue")?.value === 1, "feedback overdue uses the shared effective status");
assert(overview.attention.find((item) => item.id === "retest_incomplete")?.value === 1, "incomplete re-test uses the 120-minute grace");
assert(overview.attention.find((item) => item.id === "retest_result_pending")?.value === 1, "completed re-test waiting for status update is separate");
assert(overview.attention.find((item) => item.id === "referral")?.value === 1, "referral follow-ups do not remove referral cases");
assert(overview.sourceDistribution.every((item) => item.value > 0), "all three structured source types are represented");
assert(overview.trends.length === 6, "current term trend includes every natural month");
const marchTrend = overview.trends.find((item) => item.month === "2026-03");
assert((marchTrend?.confirmedRiskStudents ?? 0) > 0, "confirmed students are assigned to their real confirmation month");
assert((marchTrend?.formalWarningCases ?? 0) > (marchTrend?.confirmedRiskStudents ?? 0), "same-month duplicate cases are deduplicated for student trend only");
assert(overview.trends.find((item) => item.month === "2026-04")?.closedCases === 1, "closures are assigned to their real month");
assert(overview.trends.find((item) => item.month === "2026-05")?.referralCases === 1, "referrals use referredAt");
assert(overview.currentRisk.studentCount > overview.currentRisk.criticalCount, "school overview is not filtered to the current workbench teacher");
assert(JSON.stringify(input) === snapshot, "selector never mutates students, assessments, or warnings");

const gradeOverview = selector.buildSchoolOverview({ ...input, organizationFilter: { level: "grade", grade: "初一" } });
const suppressedClass = gradeOverview.organizationDistribution.find((row) => row.label === "1班");
const visibleClass = gradeOverview.organizationDistribution.find((row) => row.label === "2班");
assert(suppressedClass?.isSuppressed && suppressedClass.riskStudentCount === null, "class risk count below three is removed from the ViewModel");
assert(suppressedClass?.riskRate === null && suppressedClass.mediumCount === null && suppressedClass.highCount === null && suppressedClass.criticalCount === null, "suppressed row removes exact rate and level breakdown");
assert(suppressedClass?.riskStudentDisplay === "少量" && suppressedClass.accessibleSummary.includes("风险学生为少量") && !suppressedClass.accessibleSummary.includes("风险 2 人"), "visible and accessible copy does not disclose the suppressed count");
assert(visibleClass?.riskStudentCount === 3 && visibleClass.riskRate !== null, "class counts at the privacy threshold remain visible");
assert(!JSON.stringify(gradeOverview).includes("学生S"), "ViewModel contains no student names from the fixture");

const smallClassOverview = selector.buildSchoolOverview({ ...input, organizationFilter: { level: "class", grade: "初一", className: "1班" } });
assert(smallClassOverview.isSmallClassSuppressed && smallClassOverview.currentRisk.studentCount === null, "small-class scope removes the top-level exact risk count");
assert(smallClassOverview.riskLevelDistribution.every((item) => item.value === null && item.percentage === null), "small-class scope removes exact level values and percentages");
assert(smallClassOverview.attention.every((item) => item.value === null), "small-class scope removes exact attention counts");
assert(smallClassOverview.dispositionDistribution.active.every((item) => item.value === null) && smallClassOverview.dispositionDistribution.closedThisTermCount === null, "small-class scope removes exact disposition counts");
assert(smallClassOverview.sourceDistribution.every((item) => item.value === null), "small-class scope removes exact source counts");
assert(smallClassOverview.trends.every((item) => item.confirmedRiskStudents === null && item.formalWarningCases === null && item.closedCases === null && item.referralCases === null), "small-class scope removes exact trend values");
assert(smallClassOverview.dataIssues.every((issue) => issue.affectedCount === null), "small-class data issues do not disclose affected counts");

const lowRiskWarning = warning("W-LOW", "S-LOW", { confirmedRiskLevel: "low" });
const lowOverview = selector.buildSchoolOverview({ ...input, students: [...students, student("S-LOW", "初二", "3班")], warnings: [...warnings, lowRiskWarning] });
assert(lowOverview.dataIssues.some((issue) => issue.code === "low_active_warning_risk"), "low active warning risk is reported as an anomaly");
assert(lowOverview.currentRisk.studentCount === overview.currentRisk.studentCount, "low active warning risk is excluded from normal current-risk totals");

const exactInterventionBoundary = warning("W-BOUNDARY-I", "S1", { currentStatus: "in_intervention", interventionAppointments: [{ id: "IA-B", plannedAt: "2026-07-08 11:00", location: "咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-01 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [] }] });
const interventionBoundaryOverview = selector.buildSchoolOverview({ ...input, warnings: [exactInterventionBoundary] });
assert(interventionBoundaryOverview.attention.find((item) => item.id === "intervention_confirmation_required")?.value === 0, "exactly 60 minutes is still inside the intervention grace boundary");
const exactRetestBoundary = warning("W-BOUNDARY-R", "S1", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-B", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 10:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] });
const retestBoundaryOverview = selector.buildSchoolOverview({ ...input, warnings: [exactRetestBoundary] });
assert(retestBoundaryOverview.attention.find((item) => item.id === "retest_incomplete")?.value === 0, "exactly 120 minutes is still inside the re-test grace boundary");

const noAssessment = selector.buildSchoolOverview({ ...input, assessments: [] });
assert(!noAssessment.hasAssessmentData && noAssessment.coverage.coverageRate === null, "no assessment data is represented without a false zero-percent rate");
const noConfirmed = selector.buildSchoolOverview({ ...input, warnings: warnings.map((item) => ({ ...item, confirmedRiskLevel: undefined, currentStatus: "pending_review" })) });
assert(!noConfirmed.hasConfirmedRisk, "no confirmed risk is a distinct empty state");
const emptyScope = selector.buildSchoolOverview({ ...input, organizationFilter: { level: "grade", grade: "不存在年级" } });
assert(!emptyScope.hasScopeData, "empty organization scope is explicit");

const selectorSource = readFileSync("src/lib/school-overview.ts", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const pageSource = readFileSync("src/components/school-overview/SchoolOverviewPage.tsx", "utf8");
const analysisSource = readFileSync("src/components/school-overview/SchoolOverviewAnalysis.tsx", "utf8");
assert(!selectorSource.includes("buildWorkbenchItems"), "school overview does not reuse workbench tasks");
assert(appSource.includes("<SchoolOverviewPage />"), "sidebar route renders the real school overview page");
assert(pageSource.includes("SchoolOverviewLoading") && pageSource.includes("SchoolOverviewFailure") && pageSource.includes("failedModuleState"), "page supports loading, full failure, and recoverable module failure states");
assert(!pageSource.includes("onOpenWarning") && !analysisSource.includes("studentName") && !analysisSource.includes("studentNumber"), "school overview exposes no case drill-down or student identity fields");
assert(analysisSource.includes("aria-label={row.accessibleSummary}"), "organization rows use the privacy-safe accessible summary");

const sharedOverview = selector.buildSchoolOverview({
  students: studentMock.studentProfileMockData,
  assessments: assessmentMock.assessmentMockData,
  warnings: mock.warningMockData,
  currentTime: assessmentMock.SCHOOL_OVERVIEW_CURRENT_TIME,
  termRange: assessmentMock.SCHOOL_OVERVIEW_TERM_RANGE,
  organizationFilter: { level: "school" },
});
assert(sharedOverview.attention.every((item) => (item.value ?? 0) > 0), "shared demo data visibly covers all six attention metrics");
assert(sharedOverview.dispositionDistribution.active.every((item) => (item.value ?? 0) > 0), "shared demo data covers all six active main statuses");
assert(sharedOverview.sourceDistribution.every((item) => (item.value ?? 0) > 0), "shared demo data covers all three structured source types");
assert(sharedOverview.trends.filter((item) => (item.confirmedRiskStudents ?? 0) + (item.formalWarningCases ?? 0) + (item.closedCases ?? 0) + (item.referralCases ?? 0) > 0).length >= 4, "shared demo trend contains activity in at least four current-term months");
assert(!sharedOverview.dataIssues.some((issue) => issue.code === "missing_student"), "shared warnings all resolve to shared student records");

console.log(`school overview regression: ${assertionCount} assertions passed`);
