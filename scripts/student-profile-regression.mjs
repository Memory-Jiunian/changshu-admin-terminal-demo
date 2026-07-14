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
const recordsUrl = moduleUrl(
  compile("src/lib/warning-records.ts").replaceAll('"@/types/warning"', `"${warningTypesUrl}"`),
);
const actionsUrl = moduleUrl(
  compile("src/lib/warning-actions.ts")
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/lib/warning-feedback"', `"${feedbackUrl}"`),
);
const aggregateUrl = moduleUrl(
  compile("src/lib/student-profile-aggregate.ts")
    .replaceAll('"@/types/studentProfile"', `"${studentTypesUrl}"`)
    .replaceAll('"@/types/warning"', `"${warningTypesUrl}"`)
    .replaceAll('"@/lib/warning-records"', `"${recordsUrl}"`),
);
const filtersUrl = moduleUrl(
  compile("src/lib/student-profile-filters.ts").replaceAll(
    '"@/types/studentProfile"',
    `"${studentTypesUrl}"`,
  ),
);
const classPreferenceUrl = moduleUrl(
  compile("src/lib/student-profile-class-preference.ts")
    .replaceAll('"@/types/studentProfile"', `"${studentTypesUrl}"`),
);

const [studentTypes, actions, aggregate, filters, classPreference, studentMock, warningMock] = await Promise.all([
  import(studentTypesUrl),
  import(actionsUrl),
  import(aggregateUrl),
  import(filtersUrl),
  import(classPreferenceUrl),
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
const isNewestFirst = (items, field) => items.every(
  (item, index) => index === 0 || items[index - 1][field] >= item[field],
);

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
  advanced: { ...defaultQuery.advanced, hasCurrentWarning: ["yes"] },
});
assert(activeResults.length > 0 && activeResults.every((item) => item.hasCurrentWarning), "current-warning filter works");
const interventionResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, hasInterventionRecords: ["yes"] },
});
assert(interventionResults.length > 0 && interventionResults.every((item) => item.hasInterventionRecords), "intervention-record filter works");
const lowRiskResults = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, riskLevel: ["low"] },
});
assert(lowRiskResults.length > 0 && lowRiskResults.every((item) => item.activeRiskLevel === "low"), "low risk is available for profile filtering");

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
    hasCurrentWarning: ["yes"],
    responsiblePsychologist: [psychologist],
  },
});
assert(combinedResults.every((item) => item.hasCurrentWarning && item.currentResponsiblePsychologist === psychologist), "different advanced categories use AND");

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
  "hasCurrentWarning",
  "sourceTypes",
  "hasFormalWarning",
  "hasInterventionRecords",
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
assert(pendingDetail.caseDetails["WRN-20260708-001"]?.summary.warningId === "WRN-20260708-001", "active case detail is keyed by warning id");
assert(aggregate.getStudentProfileCaseDetail(pendingDetail, "WRN-20260708-001") === pendingDetail.caseDetails["WRN-20260708-001"], "case-detail selector returns the matching case");

const closedStudent = students.find((student) => student.studentId === "STU-0007");
const closedDetail = aggregate.buildStudentProfileDetail(closedStudent, warnings);
assert(!closedDetail.activeCase && closedDetail.historicalCases[0]?.outcome === "closed", "closed warning is historical only");
assert(!closedDetail.summary.currentResponsiblePsychologist, "historical-only student has no current owner");
assert(closedDetail.caseDetails["WRN-20260704-007"]?.summary.outcome === "closed", "closed history has a complete case detail");

const endedStudent = students.find((student) => student.studentId === "STU-0011");
const endedDetail = aggregate.buildStudentProfileDetail(endedStudent, warnings);
assert(!endedDetail.activeCase && endedDetail.historicalCases[0]?.outcome === "ended_without_warning", "inactive ended warning is historical");
assert(endedDetail.historicalCases[0]?.outcomeDescription.includes("不形成正式预警"), "ended history keeps its reason");
assert(endedDetail.caseDetails["WRN-20260701-011"]?.feedbackRecords.length === 0, "ended-without-warning detail keeps explicit empty records");

const noCaseStudent = students.find((student) => student.studentId === "STU-0105");
const noCaseDetail = aggregate.buildStudentProfileDetail(noCaseStudent, warnings);
assert(!noCaseDetail.activeCase && noCaseDetail.historicalCases.length === 0, "student without cases has explicit empty detail");
assert(!noCaseDetail.summary.activeRiskLevel && !noCaseDetail.summary.activeWarningStatus, "student without active case has no current risk or status");

const interventionSummary = summaries.find((summary) => summary.studentId === "STU-0004");
assert(interventionSummary.hasInterventionRecords, "intervention records are derived from all warning records");
const interventionStudent = students.find((student) => student.studentId === "STU-0004");
const interventionDetail = aggregate.buildStudentProfileDetail(interventionStudent, warnings);
const richCase = interventionDetail.caseDetails["WRN-20260707-004"];
assert(richCase.feedbackRequests.length === warnings.find((warning) => warning.id === richCase.summary.warningId).feedbackRequests.length, "feedback request count matches warning data");
assert(richCase.feedbackRecords.length === warnings.find((warning) => warning.id === richCase.summary.warningId).feedbackRecords.length, "feedback record count matches warning data");
assert(richCase.interventionRecords.length >= 2 && isNewestFirst(richCase.interventionRecords, "occurredAt"), "multiple interventions are newest first");
assert(isNewestFirst(richCase.feedbackRequests, "requestedAt") && isNewestFirst(richCase.feedbackRecords, "submittedAt"), "feedback requests and records are independently sorted");

const formalStudent = students.find((student) => student.studentId === "STU-0003");
const requestOnlyCase = aggregate.buildStudentProfileDetail(formalStudent, warnings).caseDetails["WRN-20260708-003"];
assert(requestOnlyCase.feedbackRequests.length > 0 && requestOnlyCase.feedbackRecords.length === 0, "case detail covers feedback request without feedback");

const retestStudent = students.find((student) => student.studentId === "STU-0005");
const retestCase = aggregate.buildStudentProfileDetail(retestStudent, warnings).caseDetails["WRN-20260706-005"];
assert(retestCase.retestRecords.length >= 2 && isNewestFirst(retestCase.retestRecords, "arrangedAt"), "multiple retests are newest first");
assert(retestCase.retestRecords.every((record) => record.scaleNames.length > 0), "retest records retain scale names");
assert(retestCase.retestRecords.some((record) => !record.completedAt), "case detail covers an unfinished retest without fabricated result");

const referralStudent = students.find((student) => student.studentId === "STU-0006");
const referralCase = aggregate.buildStudentProfileDetail(referralStudent, warnings).caseDetails["WRN-20260705-006"];
assert(isNewestFirst(referralCase.referralRecords, "referredAt") && isNewestFirst(referralCase.timeline, "occurredAt"), "referrals and timeline are newest first");
const pendingReferralStudent = students.find((student) => student.studentId === "STU-0010");
const pendingReferralCase = aggregate.buildStudentProfileDetail(pendingReferralStudent, warnings).caseDetails["WRN-20260708-010"];
assert(pendingReferralCase.referralRecords.some((record) => record.followUpRecords.length === 0), "case detail covers referral without follow-up");

const originalTimelineOrder = warnings.find((warning) => warning.id === "WRN-20260708-001").timeline.map((item) => item.id).join(",");
aggregate.buildStudentProfileCaseDetail(warnings.find((warning) => warning.id === "WRN-20260708-001"));
assert(warnings.find((warning) => warning.id === "WRN-20260708-001").timeline.map((item) => item.id).join(",") === originalTimelineOrder, "case-detail sorting does not mutate shared warning arrays");

const missingStudent = { ...noCaseStudent, studentId: "STU-MISSING", warningCaseIds: ["WRN-MISSING"] };
const missingDetail = aggregate.buildStudentProfileDetail(missingStudent, warnings);
assert(missingDetail.dataIssues.some((issue) => issue.includes("不存在")), "missing association is reported");
const mismatchedStudent = { ...noCaseStudent, warningCaseIds: ["WRN-20260708-001"] };
const mismatchedDetail = aggregate.buildStudentProfileDetail(mismatchedStudent, warnings);
assert(mismatchedDetail.dataIssues.some((issue) => issue.includes("属于其他学生")) && !mismatchedDetail.caseDetails["WRN-20260708-001"], "student mismatch is reported and excluded from case details");

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

const mixedSummary = aggregate.buildStudentProfileSummary(mixedStudent, [...warnings, syntheticHistorical]);
assert(mixedSummary.sourceTypes.includes(syntheticHistorical.sourceType), "source types include historical cases");
assert(mixedSummary.hasFormalWarning === Boolean(syntheticHistorical.confirmedRiskLevel), "formal-warning flag reads confirmed levels across all cases");
const sourceResults = filters.filterStudentProfiles([mixedSummary], {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, sourceType: [syntheticHistorical.sourceType] },
});
assert(sourceResults.length === 1, "source filtering reads all associated cases");

const schoolSearch = filters.filterStudentProfiles(summaries, {
  ...defaultQuery,
  grade,
  className,
  keyword: duplicateName,
});
assert(schoolSearch.length === 2, "keyword search ignores grade and class tabs");
const pageResult = filters.paginateStudentProfiles(Array.from({ length: 65 }, (_, index) => ({ studentId: String(index) })), 2);
assert(pageResult.items.length === 30 && pageResult.currentPage === 2 && pageResult.totalPages === 3, "pagination uses 30 items per page");

const storageValues = new Map();
const storage = {
  getItem: (key) => storageValues.get(key) ?? null,
  setItem: (key, value) => storageValues.set(key, value),
};
const firstClass = classPreference.getFirstAvailableClass(options);
classPreference.saveStudentClassPreference(storage, firstClass);
const storedValue = JSON.parse(storageValues.get(classPreference.getStudentClassPreferenceKey()));
assert(Object.keys(storedValue).sort().join(",") === "className,grade", "localStorage stores grade and class only");
assert(classPreference.getStudentClassPreferenceKey().includes("changshu-demo-school.psychologist-chen"), "class preference key is isolated by school and psychologist");
assert(classPreference.loadStudentClassPreference(storage, options, summaries).className === firstClass.className, "valid class preference is restored");
storageValues.set(classPreference.getStudentClassPreferenceKey(), JSON.stringify({ grade: "失效年级", className: "失效班级" }));
assert(classPreference.loadStudentClassPreference(storage, options, summaries).className === firstClass.className, "invalid class preference falls back to first available class");

const formalWithoutConfirmation = {
  ...warnings.find((warning) => warning.currentStatus === "formal_warning"),
  id: "WRN-MISSING-CONFIRMATION",
  studentId: noCaseStudent.studentId,
  studentName: noCaseStudent.studentName,
  confirmedRiskLevel: undefined,
};
const inconsistentStudent = { ...noCaseStudent, warningCaseIds: [formalWithoutConfirmation.id] };
assert(aggregate.buildStudentProfileDetail(inconsistentStudent, [...warnings, formalWithoutConfirmation]).dataIssues.some((issue) => issue.includes("缺少心理老师确认风险等级")), "missing confirmed level in formal stage is reported");

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

const interventionWarning = warnings.find((warning) => warning.id === "WRN-20260707-004");
const addedIntervention = actions.applyWarningAction(
  interventionWarning,
  { type: "add_intervention", values: { occurredAt: "2026-07-14 13:00", method: "面谈", summary: "共享记录回归", judgment: "继续观察", followUpPlan: "一周后复盘" } },
  "2026-07-14 13:00",
);
assert(addedIntervention.success, "warning intervention action succeeds for profile record sync");
const interventionWarnings = warnings.map((warning) => warning.id === interventionWarning.id ? addedIntervention.warning : warning);
const refreshedCaseDetail = aggregate.buildStudentProfileDetail(interventionStudent, interventionWarnings).caseDetails[interventionWarning.id];
assert(refreshedCaseDetail.interventionRecords.length === interventionWarning.interventionRecords.length + 1 && refreshedCaseDetail.interventionRecords[0].summary === "共享记录回归", "profile case detail reflects a newly added shared intervention");

const appSource = readFileSync("src/App.tsx", "utf8");
const warningPageSource = readFileSync("src/components/warning/WarningManagementPage.tsx", "utf8");
const confirmDialogSource = readFileSync("src/components/warning/ConfirmFormalWarningDialog.tsx", "utf8");
const navigationSource = readFileSync("src/types/navigation.ts", "utf8");
const archiveSource = readFileSync("src/components/warning/ArchiveRecordDialog.tsx", "utf8");
const activeCaseSource = readFileSync("src/components/student-profile/StudentActiveCase.tsx", "utf8");
const historyCaseSource = readFileSync("src/components/student-profile/StudentCaseSummaryList.tsx", "utf8");
const retestSectionSource = readFileSync("src/components/case-records/CaseRetestSection.tsx", "utf8");
const exportDialogSource = readFileSync("src/components/student-profile/StudentProfileExportDialog.tsx", "utf8");
const exportReportSource = readFileSync("src/components/student-profile/StudentProfilePrintableReport.tsx", "utf8");
assert(appSource.includes("<AdminDataProvider>"), "provider is mounted above page switching");
assert(appSource.includes("StudentProfileWarningReturnContext") && appSource.includes("profileState"), "app owns a typed profile return context");
assert(["query", "page", "selectedStudentId", "drawerOpen", "drawerView", "selectedCaseId", "profileScrollTop", "caseDetailScrollTop", "expandedRecordSections"].every((field) => navigationSource.includes(`${field}`)), "return context covers profile, case, scroll, and expanded-section state");
assert(warningPageSource.includes("useAdminData()") && !warningPageSource.includes("warningMockData"), "warning page consumes shared state instead of a local mock copy");
assert(confirmDialogSource.includes('["medium", "high", "critical"]') && !confirmDialogSource.includes('["low"'), "formal-warning confirmation excludes low risk");
assert(archiveSource.includes("CaseRecordContent") && !archiveSource.includes("ProcessTimeline"), "archive dialog uses shared read-only case record components");
assert(activeCaseSource.includes("查看完整记录") && activeCaseSource.includes("查看预警详情") && historyCaseSource.includes("查看完整记录"), "profile summary actions distinguish complete records from warning detail");
assert(!retestSectionSource.includes("record.conclusion") && retestSectionSource.includes("尚未完成复测"), "shared retest records show objective results without psychologist conclusion");
assert(richCase.riskEvidence.deepAssessmentRecords.some((record) => record.responses.length > 0), "case detail exposes structured assessment responses from warning data");
assert(richCase.riskEvidence.aiConversationRecords.some((record) => record.messages.length > 0), "case detail exposes visible AI messages from warning data");
assert(richCase.feedbackCollaboration.rounds.length > 0 && richCase.timeline.some((item) => item.id.startsWith("TL-FEEDBACK-")), "case detail derives feedback rounds and feedback timeline events");
assert(referralCase.referralRecords.some((record) => record.followUpRecords.length > 0), "legacy referral results migrate to follow-up records");
assert(exportDialogSource.includes('type="checkbox"') && exportDialogSource.includes("window.print()"), "profile export requires explicit sensitive-record selection and uses browser print");
assert(exportReportSource.includes("includeSensitiveSourceRecords") && !exportReportSource.includes("html2canvas"), "export report excludes sensitive source records by default and avoids screenshots");

console.log(`student profile regression assertions: ${assertionCount} passed`);
