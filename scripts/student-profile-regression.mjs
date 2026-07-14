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
const studentTypesUrl = moduleUrl(compile("src/types/studentProfile.ts"));
const feedbackUrl = moduleUrl(compile("src/lib/warning-feedback.ts"));
const actionsUrl = moduleUrl(
  compile("src/lib/warning-actions.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`),
);
const aggregateUrl = moduleUrl(
  compile("src/lib/student-profile-aggregate.ts")
    .replaceAll('"@/types/studentProfile"', `"${studentTypesUrl}"`)
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const filtersUrl = moduleUrl(
  compile("src/lib/student-profile-filters.ts").replaceAll(
    '"@/types/studentProfile"',
    `"${studentTypesUrl}"`,
  ),
);

const [studentTypes, actions, aggregate, filters, studentMock, warningMock] = await Promise.all([
  import(studentTypesUrl),
  import(actionsUrl),
  import(aggregateUrl),
  import(filtersUrl),
  import(moduleUrl(compile("src/data/studentProfileMock.ts"))),
  import(moduleUrl(compile("src/data/warningMock.ts"))),
]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}

const students = studentMock.studentProfileMockData;
const warnings = warningMock.warningMockData;
const summaries = aggregate.buildStudentProfileSummaries(students, warnings);
const defaultQuery = filters.createDefaultStudentProfileFilterQuery();
const defaultResults = filters.filterStudentProfiles(summaries, defaultQuery);
const options = filters.getStudentProfileFilterOptions(summaries);

assert(students.length >= 10, "mock covers list scenarios");
assert(defaultResults.length > 0 && defaultResults.every((item) => item.enrollmentStatus === "enrolled"), "default list only includes enrolled students");
assert(defaultResults.every((item, index) => index === 0 || defaultResults[index - 1].updatedAt >= item.updatedAt), "default results are newest first");
assert(students.some((item) => item.enrollmentStatus === "graduated"), "mock covers graduated students");
assert(students.some((item) => item.enrollmentStatus === "left_school"), "mock covers left-school students");
assert(students.some((item) => item.enrollmentHistory.length > 1), "mock covers enrollment changes");
assert(new Set(students.map((item) => item.studentName)).size < students.length, "mock covers students with the same name");

const duplicateName = students.find((student, index) => students.findIndex((item) => item.studentName === student.studentName) !== index).studentName;
const nameResults = filters.filterStudentProfiles(summaries, { ...defaultQuery, keyword: duplicateName.slice(0, 1) });
assert(nameResults.some((item) => item.studentName.includes(duplicateName.slice(0, 1))), "name search supports fuzzy matching");
const duplicateResults = filters.filterStudentProfiles(summaries, { ...defaultQuery, keyword: duplicateName });
assert(duplicateResults.length === 2 && new Set(duplicateResults.map((item) => item.studentNumber)).size === 2, "same-name students remain distinguishable by number");

const numberTarget = defaultResults[0];
const numberResults = filters.filterStudentProfiles(summaries, { ...defaultQuery, keyword: numberTarget.studentNumber.slice(0, 6) });
assert(numberResults.some((item) => item.studentId === numberTarget.studentId), "student-number prefix search works");

const grade = options.grades.find((item) => (options.classesByGrade[item] ?? []).length > 1) ?? options.grades[0];
const className = options.classesByGrade[grade][0];
const gradeResults = filters.filterStudentProfiles(summaries, { ...defaultQuery, grade, className: "" });
assert(gradeResults.every((item) => item.currentGrade === grade), "grade filter works");
const classResults = filters.filterStudentProfiles(summaries, { ...defaultQuery, grade, className });
assert(classResults.every((item) => item.currentGrade === grade && item.currentClass === className), "linked class filter works");
assert(options.classesByGrade[grade].every((item) => students.some((student) => student.currentGrade === grade && student.currentClass === item)), "class options are scoped to grade");

const activeResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, hasActiveWarning: ["yes"] },
});
assert(activeResults.length > 0 && activeResults.every((item) => item.hasActiveWarning), "active-warning filter works");
const interventionResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, hasInterventionHistory: ["yes"] },
});
assert(interventionResults.length > 0 && interventionResults.every((item) => item.hasInterventionHistory), "intervention-history filter works");

const riskValues = [...new Set(defaultResults.flatMap((item) => item.activeRiskLevel ? [item.activeRiskLevel] : []))];
const riskResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, riskLevel: riskValues.slice(0, 2) },
});
assert(riskResults.every((item) => riskValues.slice(0, 2).includes(item.activeRiskLevel)), "same-category risk options use OR");

const psychologist = options.responsiblePsychologists[0];
const combinedResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: {
    ...defaultQuery.advanced,
    hasActiveWarning: ["yes"],
    responsiblePsychologist: [psychologist],
  },
});
assert(combinedResults.every((item) => item.hasActiveWarning && item.currentResponsiblePsychologist === psychologist), "different advanced categories use AND");

const historicalEnrollmentResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, enrollmentStatus: ["graduated", "left_school"] },
});
assert(historicalEnrollmentResults.length >= 2 && historicalEnrollmentResults.every((item) => item.enrollmentStatus !== "enrolled"), "historical enrollment states use OR");

const cloned = filters.cloneStudentProfileAdvancedFilters(defaultQuery.advanced);
cloned.enrollmentStatus.length = 0;
assert(defaultQuery.advanced.enrollmentStatus[0] === "enrolled", "advanced-filter draft does not mutate applied filters");
assert(studentTypes.createDefaultStudentProfileAdvancedFilters().enrollmentStatus[0] === "enrolled", "advanced reset restores enrolled default");

const duplicateBusinessFields = [
  "hasActiveWarning",
  "activeRiskLevel",
  "activeWarningStatus",
  "hasInterventionHistory",
  "currentResponsiblePsychologist",
];
assert(students.every((student) => duplicateBusinessFields.every((field) => !(field in student))), "base student mock has no duplicated warning state");

const warningIds = new Set(warnings.map((warning) => warning.id));
assert(students.flatMap((student) => student.warningCaseIds).every((id) => id.startsWith("WRN-") && warningIds.has(id)), "all warningCaseIds match real warnings");
assert(summaries.every((summary) => summary.dataIssues.length === 0), "production mock has no association issues");
assert(summaries.every((summary) => summary.warningCount === warnings.filter((warning) => warning.studentId === summary.studentId).length), "warning counts are derived by studentId");

const pendingStudent = students.find((student) => student.studentId === "STU-0001");
const pendingDetail = aggregate.buildStudentProfileDetail(pendingStudent, warnings);
assert(pendingDetail.activeCase?.warningId === "WRN-20260708-001", "active case uses the matching warning");
assert(pendingDetail.activeCase?.startedAt === "2026-07-07 16:20", "active case starts at the earliest timeline event");
assert(pendingDetail.historicalCases.length === 0, "active-only student has no fabricated history");

const closedStudent = students.find((student) => student.studentId === "STU-0007");
const closedDetail = aggregate.buildStudentProfileDetail(closedStudent, warnings);
assert(!closedDetail.activeCase && closedDetail.historicalCases[0]?.outcome === "closed", "closed warning is historical only");
assert(!closedDetail.summary.currentResponsiblePsychologist, "historical-only student has no current owner");

const endedStudent = students.find((student) => student.studentId === "STU-0011");
const endedDetail = aggregate.buildStudentProfileDetail(endedStudent, warnings);
assert(!endedDetail.activeCase && endedDetail.historicalCases[0]?.outcome === "ended_without_warning", "inactive ended warning is historical");
assert(endedDetail.historicalCases[0]?.outcomeDescription.includes("不形成正式预警"), "ended history keeps its reason");

const noCaseStudent = students.find((student) => student.studentId === "STU-0105");
const noCaseDetail = aggregate.buildStudentProfileDetail(noCaseStudent, warnings);
assert(!noCaseDetail.activeCase && noCaseDetail.historicalCases.length === 0, "student without cases has explicit empty detail");
assert(!noCaseDetail.summary.activeRiskLevel && !noCaseDetail.summary.activeWarningStatus, "student without active case has no current risk or status");

const interventionSummary = summaries.find((summary) => summary.studentId === "STU-0004");
assert(interventionSummary.hasInterventionHistory, "intervention history is derived from warning records");

const missingStudent = { ...noCaseStudent, studentId: "STU-MISSING", warningCaseIds: ["WRN-MISSING"] };
const missingDetail = aggregate.buildStudentProfileDetail(missingStudent, warnings);
assert(missingDetail.dataIssues.some((issue) => issue.includes("不存在")), "missing association is reported");

const extraActive = {
  ...warnings.find((warning) => warning.id === "WRN-20260708-002"),
  id: "WRN-MULTI-ACTIVE",
  studentId: pendingStudent.studentId,
  studentName: pendingStudent.studentName,
  activityTime: "2026-07-15 10:00",
};
const multiStudent = { ...pendingStudent, warningCaseIds: [...pendingStudent.warningCaseIds, extraActive.id] };
const multiDetail = aggregate.buildStudentProfileDetail(multiStudent, [...warnings, extraActive]);
assert(multiDetail.dataIssues.some((issue) => issue.includes("2 条活动事项")), "multiple active cases are reported");
assert(multiDetail.activeCase?.warningId === extraActive.id, "multiple active cases temporarily select the newest");

const syntheticHistorical = {
  ...warnings.find((warning) => warning.id === "WRN-20260701-011"),
  id: "WRN-PREVIOUS-HISTORY",
  studentId: pendingStudent.studentId,
  studentName: pendingStudent.studentName,
};
const mixedStudent = { ...pendingStudent, warningCaseIds: [...pendingStudent.warningCaseIds, syntheticHistorical.id] };
const mixedDetail = aggregate.buildStudentProfileDetail(mixedStudent, [...warnings, syntheticHistorical]);
assert(mixedDetail.activeCase?.warningId === "WRN-20260708-001" && mixedDetail.historicalCases[0]?.warningId === syntheticHistorical.id, "active and historical cases remain separate");

const updatedWarning = actions.applyWarningAction(
  warnings.find((warning) => warning.id === "WRN-20260708-001"),
  { type: "continue_observation", values: { observationNote: "共享状态回归", nextReviewAt: "2026-07-16 10:00" } },
  "2026-07-14 12:00",
);
assert(updatedWarning.success, "warning action succeeds in shared-state scenario");
const sharedWarnings = warnings.map((warning) => warning.id === updatedWarning.warning.id ? updatedWarning.warning : warning);
const refreshedSummary = aggregate.buildStudentProfileSummary(pendingStudent, sharedWarnings);
const refreshedDetail = aggregate.buildStudentProfileDetail(pendingStudent, sharedWarnings);
assert(refreshedSummary.activeWarningStatus === "observing", "profile summary reads updated shared warning status");
assert(refreshedDetail.activeCase?.latestActivity === "心理老师标记继续观察", "profile detail reads updated shared warning activity");
assert(sharedWarnings.find((warning) => warning.id === updatedWarning.warning.id).currentStatus === "observing", "updated warning remains available when returning to warning management");

const appSource = readFileSync("src/App.tsx", "utf8");
const warningPageSource = readFileSync("src/components/warning/WarningManagementPage.tsx", "utf8");
assert(appSource.includes("<AdminDataProvider>"), "provider is mounted above page switching");
assert(warningPageSource.includes("useAdminData()") && !warningPageSource.includes("warningMockData"), "warning page consumes shared state instead of a local mock copy");

console.log(`student profile regression assertions: ${assertionCount} passed`);
