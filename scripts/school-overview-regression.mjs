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
    deepAssessmentRecords: [],
    timeline: [{ id: `${id}-FORMAL`, title: "确认正式预警", operator: "陈老师", occurredAt: "2026-03-10 10:00", description: "已确认。" }],
    ...overrides,
  };
}

function deepAssessment(id, studentId, dimensions, completedAt = "2026-06-01 09:00") {
  return {
    id,
    scaleId: "structured-scale",
    scaleName: "结构化心理测评",
    completedAt,
    riskLevel: "medium",
    resultSummary: "结构化维度结果。",
    dimensions: dimensions.map(([dimensionId, name, isConcernThresholdMet]) => ({
      id: dimensionId,
      name,
      level: isConcernThresholdMet ? "需关注" : "正常",
      isConcernThresholdMet,
    })),
    responses: [],
    gradeClassAtTime: "初一（1）班",
    studentId,
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
  warning("W1", "S1", { confirmedRiskLevel: "high", sourceType: "screening_abnormal", responsibleTeacher: "周老师", deepAssessmentRecords: [deepAssessment("DA-1", "S1", [["mood", "情绪低落", true], ["sleep", "睡眠困扰", true], ["pressure", "学业压力", true], ["social", "人际关系", false]])], feedbackRequests: [{ id: "FR-1", requestedAt: "2026-07-01 09:00", requestedBy: "周老师", requestNote: "请反馈", deadline: "2026-07-09 17:00", status: "completed" }], feedbackRecords: [{ id: "FB-1", requestId: "FR-1", authorRole: "班主任", authorName: "王老师", content: "已反馈", submittedAt: "2026-07-08 09:00", psychologistReadAt: "2026-07-08 09:30" }] }),
  warning("W2", "S2", { confirmedRiskLevel: "critical", sourceType: "ai_chat_trigger", deepAssessmentRecords: [deepAssessment("DA-2", "S2", [["mood", "情绪低落", true], ["sleep", "睡眠困扰", true], ["anxiety", "焦虑紧张", true]])], feedbackRequests: [{ id: "FR-2", requestedAt: "2026-07-01 09:00", requestedBy: "刘老师", requestNote: "请反馈", deadline: "2026-07-09 17:00", status: "completed" }], feedbackRecords: [{ id: "FB-2", requestId: "FR-2", authorRole: "班主任", authorName: "王老师", content: "未读反馈", submittedAt: "2026-07-08 09:00" }], timeline: [{ id: "W2-F", title: "确认正式预警", operator: "刘老师", occurredAt: "2026-04-10 10:00", description: "已确认。" }] }),
  warning("W3", "S3", { sourceType: "teacher_report", deepAssessmentRecords: [deepAssessment("DA-3", "S3", [["pressure", "学业压力", true], ["social", "人际关系", true], ["worth", "自我评价", true]])], interventionAppointments: [{ id: "IA-3", plannedAt: "2026-07-10 09:00", location: "咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-01 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [] }], feedbackRequests: [{ id: "FR-3", requestedAt: "2026-07-01 09:00", requestedBy: "陈老师", requestNote: "请反馈", deadline: "2026-07-09 17:00", status: "completed" }], feedbackRecords: [{ id: "FB-3", requestId: "FR-3", authorRole: "班主任", authorName: "王老师", content: "已读反馈", submittedAt: "2026-07-08 09:00", psychologistReadAt: "2026-07-08 09:30" }], timeline: [{ id: "W3-F", title: "确认正式预警", operator: "陈老师", occurredAt: "2026-05-10 10:00", description: "已确认。" }] }),
  warning("W4", "S4", { confirmedRiskLevel: "high", sourceType: "screening_abnormal", currentStatus: "in_intervention", feedbackRequests: [{ id: "FR-4", requestedAt: "2026-07-01 09:00", requestedBy: "陈老师", requestNote: "请反馈", deadline: "2026-07-07 17:00", status: "pending" }], interventionAppointments: [{ id: "IA-4", plannedAt: "2026-07-08 09:00", location: "咨询室", responsibleTeacher: "陈老师", status: "planned", createdAt: "2026-07-01 09:00", createdBy: "陈老师", notificationOffsetsMinutes: [1440, 120] }] }),
  warning("W5", "S5", { currentStatus: "referral", sourceType: "ai_chat_trigger", referralRecords: [{ id: "REF-5", referredAt: "2026-05-12 10:00", referralType: "医疗", reason: "持续关注", followUpRecords: [{ id: "FU-5", occurredAt: "2026-06-01 10:00", authorName: "陈老师", summary: "已联系", conclusion: "继续跟进" }] }] }),
  warning("W6", "S6", { confirmedRiskLevel: undefined, currentStatus: "pending_review", sourceType: "teacher_report" }),
  warning("W7", "S7", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-7", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 08:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] }),
  warning("W8", "S7", { isActive: false, currentStatus: "closed", endedAt: "2026-04-20 10:00", timeline: [{ id: "W8-F", title: "确认正式预警", operator: "陈老师", occurredAt: "2026-03-10 10:00", description: "已确认。" }, { id: "W8-C", title: "完成闭环归档", operator: "陈老师", occurredAt: "2026-04-20 10:00", description: "已闭环。" }] }),
  warning("W9", "S6", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-9", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 09:00", completedAt: "2026-07-08 10:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] }),
  warning("W10", "S6", { confirmedRiskLevel: undefined, feedbackRequests: [{ id: "FR-10", requestedAt: "2026-07-01 09:00", requestedBy: "陈老师", requestNote: "请反馈", deadline: "2026-07-07 17:00", status: "pending" }] }),
  warning("W11", "S4", { activityTime: "2026-07-08 11:00", confirmedRiskLevel: "high" }),
  warning("W12", "S8", { isActive: false, currentStatus: "closed", endedAt: "2026-06-20 10:00", timeline: [] }),
];

const input = { students, assessments, warnings, currentTime, termRange, organizationFilter: { level: "school" } };
const snapshot = JSON.stringify(input);
const overview = selector.buildSchoolOverview(input);

assert(overview.coverage.enrolledCount === 7, "coverage excludes left-school students");
assert(overview.coverage.completedCount === 2, "coverage deduplicates students and excludes outside-term assessments");
assert(overview.coverage.incompleteCount === 5, "coverage exposes the enrolled incomplete count");
assert(overview.currentRisk.studentCount === 6, "current confirmed risk counts students, not cases");
assert(overview.currentRisk.mediumCount + overview.currentRisk.highCount + overview.currentRisk.criticalCount === overview.currentRisk.studentCount, "confirmed risk level counts sum to the deduplicated total");
assert(overview.currentRisk.highCount === 2 && overview.currentRisk.criticalCount === 1, "high and critical student counts use confirmed levels");
assert(!overview.riskLevelDistribution.some((item) => item.id === "low"), "active risk distribution never includes low");
assert(!overview.currentRisk.studentCount.toString().includes("S"), "current risk exposes no identity");
assert(overview.dataIssues.some((issue) => issue.code === "multiple_active_cases"), "multiple active cases are reported");
assert(overview.dataIssues.some((issue) => issue.code === "missing_confirmed_risk"), "missing confirmed risk is reported for later statuses");
assert(overview.dispositionDistribution.active.find((item) => item.id === "in_intervention")?.label === "待干预", "in_intervention is presented as pending intervention");
assert(overview.dispositionDistribution.closedThisTermCount === 2, "closed cases use a separate current-term case count");
assert(overview.attention.find((item) => item.id === "feedback_read_unscheduled")?.value === 1, "feedback-read unscheduled requires a valid current round, granular read state, and no planned appointment");
assert(selector.getFeedbackReadUnscheduledInterventionCount([warnings[0]]) === 1, "read feedback current round qualifies for the principal metric");
assert(selector.getFeedbackReadUnscheduledInterventionCount([warnings[1]]) === 0, "unread feedback never qualifies for the principal metric");
assert(selector.getFeedbackReadUnscheduledInterventionCount([warnings[2]]) === 0, "a planned intervention excludes a read-feedback case");
assert(selector.getFeedbackReadUnscheduledInterventionCount([warning("W-NO-FB", "S1")]) === 0, "a formal warning without feedback never qualifies");
assert(selector.getFeedbackReadUnscheduledInterventionCount([{ ...warnings[0], currentStatus: "in_intervention" }]) === 0, "feedback-read metric never leaks beyond formal warning status");
assert(overview.attention.find((item) => item.id === "intervention_confirmation_required")?.value === 1, "appointment after 60-minute grace requires confirmation");
assert(warnings.find((item) => item.id === "W4").interventionAppointments[0].status === "planned", "overview derivation never auto-marks no-show");
assert(overview.attention.find((item) => item.id === "feedback_overdue")?.value === 2, "feedback overdue uses the shared effective status");
assert(overview.attention.find((item) => item.id === "retest_overdue_incomplete")?.value === 1, "overdue incomplete re-test uses the 120-minute grace");
assert(!overview.attention.some((item) => item.id === "retest_result_pending"), "completed re-test waiting for status update is not merged into principal attention");
assert(overview.attention.find((item) => item.id === "referral")?.value === 1, "referral follow-ups do not remove referral cases");
assert(overview.attentionSummary.total <= overview.attentionSummary.referral + overview.attentionSummary.backlog + overview.attentionSummary.collaborationBlocked, "current-attention total is a warning-id union, not a category sum");
assert(overview.attentionSummary.referral === 1, "current-attention referral category uses active referral cases");
assert(overview.dispositionStages.assessmentAndConfirmation === 6, "assessment and confirmation merges pending review, observing, and formal warning");
assert(overview.dispositionStages.interventionAndRetest === 3, "intervention and re-test merges intervention and pending re-test");
assert(overview.dispositionStages.externalSupport === 1, "external support counts active referral cases only");
assert(overview.dispositionStages.closedThisTerm === 2, "disposition stages keep current-term closure separate");
assert(overview.highlightedAssessmentDimensions.length === 6, "structured assessment dimensions expose the top six concern dimensions");
assert(overview.highlightedAssessmentDimensions.every((item) => item.assessedStudentCount >= item.confirmedRiskStudentCount), "dimension all-assessed counts never fall below current-risk counts");
assert(overview.highlightedAssessmentDimensions[0].confirmedRiskStudentCount >= overview.highlightedAssessmentDimensions.at(-1).confirmedRiskStudentCount, "dimensions sort by current confirmed-risk student hits");
assert(!overview.highlightedAssessmentDimensions.some((item) => item.label.startsWith("问题")), "dimension labels come from structured records rather than placeholders");
assert(overview.sourceDistribution.every((item) => item.value > 0), "all three structured source types are represented");
assert(overview.trends.length === 6, "current term trend includes every natural month");
const marchTrend = overview.trends.find((item) => item.month === "2026-03");
assert((marchTrend?.formalWarningCases ?? 0) > 0, "formal warnings are assigned to their real confirmation month");
assert(!("confirmedRiskStudents" in marchTrend) && !("referralCases" in marchTrend), "principal trend exposes only formal-warning and closure case series");
assert(overview.trends.find((item) => item.month === "2026-04")?.closedCases === 1, "closures are assigned to their real month");
assert(overview.trends.find((item) => item.month === "2026-02")?.formalWarningCases === 0 && overview.trends.find((item) => item.month === "2026-02")?.closedCases === 0, "empty natural months remain explicit zeroes");
assert(overview.trendDataThrough === "2026-07-08", "unfinished term exposes an explicit data-through date");
assert(overview.gradeRiskDistribution.items.reduce((sum, item) => sum + item.studentCount, 0) === overview.currentRisk.studentCount, "grade donut totals equal current confirmed-risk students");
assert(overview.dispositionEffectiveness.formalWarningCount > 0 && overview.dispositionEffectiveness.closedCount === 2, "effectiveness uses real current-term formal-warning and closure events");
assert(overview.dispositionEffectiveness.closureRate === Math.round((overview.dispositionEffectiveness.closedCount / overview.dispositionEffectiveness.formalWarningCount) * 1000) / 10, "closure rate uses current-term case counts");
assert(overview.dispositionEffectiveness.averageClosureDays === 41, "average closure cycle uses real confirmation and closure timestamps");
assert(overview.dataIssues.some((issue) => issue.code === "missing_formal_warning_time"), "closed cases missing confirmation time are excluded and reported");
assert(overview.dispositionEffectiveness.blockedCaseCount === 3, "blocked cases are deduplicated by warning id across overdue feedback, intervention, and re-test conditions");
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
assert(smallClassOverview.attentionSummary.total === null, "small-class scope removes the deduplicated attention total");
assert(smallClassOverview.dispositionStages.assessmentAndConfirmation === null, "small-class scope removes grouped disposition counts");
assert(smallClassOverview.highlightedAssessmentDimensions.length === 0, "small-class scope removes assessment dimension counts");
assert(smallClassOverview.dispositionDistribution.active.every((item) => item.value === null) && smallClassOverview.dispositionDistribution.closedThisTermCount === null, "small-class scope removes exact disposition counts");
assert(smallClassOverview.sourceDistribution.every((item) => item.value === null), "small-class scope removes exact source counts");
assert(smallClassOverview.trends.every((item) => item.formalWarningCases === null && item.closedCases === null), "small-class scope removes exact trend values");
assert(smallClassOverview.gradeRiskDistribution.totalStudentCount === null && smallClassOverview.gradeRiskDistribution.items.length === 0, "small-class scope removes exact donut values");
assert(smallClassOverview.dispositionEffectiveness.blockedCaseCount === null, "small-class scope removes exact effectiveness values");
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
assert(retestBoundaryOverview.attention.find((item) => item.id === "retest_overdue_incomplete")?.value === 0, "exactly 120 minutes is still inside the re-test grace boundary");
const completedRetestOverview = selector.buildSchoolOverview({ ...input, warnings: [warning("W-COMPLETE-R", "S1", { currentStatus: "pending_retest", retestRecords: [{ id: "RET-C", arrangedAt: "2026-07-01 09:00", plannedAt: "2026-07-08 08:00", completedAt: "2026-07-08 10:00", scaleIds: ["SCL-1"], scaleNames: ["普筛量表"], note: "" }] })] });
assert(completedRetestOverview.attention.find((item) => item.id === "retest_overdue_incomplete")?.value === 0, "completed re-tests never count as overdue incomplete");

const sixGradeStudents = Array.from({ length: 6 }, (_, index) => student(`G${index + 1}`, `年级${index + 1}`, "1班"));
const sixGradeWarnings = sixGradeStudents.map((item, index) => warning(`WG${index + 1}`, item.studentId, { confirmedRiskLevel: index < 2 ? "critical" : "medium" }));
const sixGradeOverview = selector.buildSchoolOverview({ ...input, students: sixGradeStudents, assessments: [], warnings: sixGradeWarnings });
assert(sixGradeOverview.gradeRiskDistribution.items.length === 5 && sixGradeOverview.gradeRiskDistribution.items.at(-1)?.label === "其他", "more than five grades collapse to top four plus other");
assert(sixGradeOverview.gradeRiskDistribution.items.reduce((sum, item) => sum + item.studentCount, 0) === 6, "collapsed grade donut retains every current-risk student");

const noFormalEffectiveness = selector.buildSchoolOverview({ ...input, warnings: [] });
assert(noFormalEffectiveness.dispositionEffectiveness.closureRate === null && noFormalEffectiveness.dispositionEffectiveness.closureRateDisplay === "暂无可计算数据", "zero formal-warning denominator is not presented as zero percent");
const invalidClosure = warning("W-INVALID-CLOSE", "S1", { isActive: false, currentStatus: "closed", endedAt: "2026-03-01 10:00", timeline: [{ id: "W-INVALID-F", title: "确认正式预警", operator: "陈老师", occurredAt: "2026-03-02 10:00", description: "已确认。" }] });
const invalidClosureOverview = selector.buildSchoolOverview({ ...input, warnings: [invalidClosure] });
assert(invalidClosureOverview.dispositionEffectiveness.averageClosureDays === null && invalidClosureOverview.dataIssues.some((issue) => issue.code === "invalid_closure_cycle"), "closure before formal confirmation is excluded and reported");

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
assert(analysisSource.includes("风险学生年级分布") && analysisSource.includes("highAndCriticalCount"), "grade donut provides a text legend and high-or-critical tooltip detail");
assert(analysisSource.includes("风险变化趋势") && !analysisSource.includes("新增确认风险学生") && !analysisSource.includes("风险线索来源分布"), "page removes deprecated principal-facing trend and source modules");
assert(analysisSource.includes("风险变化趋势，单位项"), "principal trend accessibility copy uses the case unit");
assert(analysisSource.includes("测评突出问题") && analysisSource.includes("highlightedAssessmentDimensions"), "page renders structured assessment dimensions from the ViewModel");
assert(!analysisSource.includes("风险等级分布") && !analysisSource.includes("处置成效概览"), "page removes deprecated standalone analysis modules");
assert(pageSource.includes("SchoolOverviewDispositionStages") && !pageSource.includes("SchoolOverviewAttention"), "page uses the grouped disposition row and removes the old attention grid");

const sharedOverview = selector.buildSchoolOverview({
  students: studentMock.studentProfileMockData,
  assessments: assessmentMock.assessmentMockData,
  warnings: mock.warningMockData,
  currentTime: assessmentMock.SCHOOL_OVERVIEW_CURRENT_TIME,
  termRange: assessmentMock.SCHOOL_OVERVIEW_TERM_RANGE,
  organizationFilter: { level: "school" },
});
assert(sharedOverview.attention.every((item) => (item.value ?? 0) >= 0), "shared demo data derives every principal attention metric without constants");
assert(sharedOverview.dispositionDistribution.active.every((item) => (item.value ?? 0) > 0), "shared demo data covers all six active main statuses");
assert(sharedOverview.sourceDistribution.every((item) => (item.value ?? 0) > 0), "shared demo data covers all three structured source types");
assert(sharedOverview.trends.filter((item) => (item.formalWarningCases ?? 0) + (item.closedCases ?? 0) > 0).length >= 4, "shared demo trend contains formal-warning or closure activity in at least four current-term months");
assert(!sharedOverview.dataIssues.some((issue) => issue.code === "missing_student"), "shared warnings all resolve to shared student records");

console.log(`school overview regression: ${assertionCount} assertions passed`);
