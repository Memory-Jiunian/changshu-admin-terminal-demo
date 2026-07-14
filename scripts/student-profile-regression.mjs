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

const typesUrl = moduleUrl(compile("src/types/studentProfile.ts"));
const filtersUrl = moduleUrl(
  compile("src/lib/student-profile-filters.ts").replaceAll(
    '"@/types/studentProfile"',
    `"${typesUrl}"`,
  ),
);
const [types, filters, mock] = await Promise.all([
  import(typesUrl),
  import(filtersUrl),
  import(moduleUrl(compile("src/data/studentProfileMock.ts"))),
]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}

const profiles = mock.studentProfileMockData;
const defaultQuery = filters.createDefaultStudentProfileFilterQuery();
const defaultResults = filters.filterStudentProfiles(profiles, defaultQuery);
const options = filters.getStudentProfileFilterOptions(profiles);

assert(profiles.length >= 10, "mock covers list scenarios");
assert(defaultResults.length > 0 && defaultResults.every((item) => item.enrollmentStatus === "enrolled"), "default list only includes enrolled students");
assert(defaultResults.every((item, index) => index === 0 || defaultResults[index - 1].updatedAt >= item.updatedAt), "default results are newest first");
assert(profiles.some((item) => item.enrollmentStatus === "graduated"), "mock covers graduated students");
assert(profiles.some((item) => item.enrollmentStatus === "left_school"), "mock covers left-school students");
assert(profiles.some((item) => item.enrollmentHistory.length > 1), "mock covers enrollment changes");
assert(new Set(profiles.map((item) => item.studentName)).size < profiles.length, "mock covers students with the same name");

const duplicateName = profiles.find((profile, index) => profiles.findIndex((item) => item.studentName === profile.studentName) !== index).studentName;
const nameResults = filters.filterStudentProfiles(profiles, { ...defaultQuery, keyword: duplicateName.slice(0, 1) });
assert(nameResults.some((item) => item.studentName.includes(duplicateName.slice(0, 1))), "name search supports fuzzy matching");
const duplicateResults = filters.filterStudentProfiles(profiles, { ...defaultQuery, keyword: duplicateName });
assert(duplicateResults.length === 2 && new Set(duplicateResults.map((item) => item.studentNumber)).size === 2, "same-name students remain distinguishable by number");

const numberTarget = defaultResults[0];
const numberResults = filters.filterStudentProfiles(profiles, { ...defaultQuery, keyword: numberTarget.studentNumber.slice(0, 6) });
assert(numberResults.some((item) => item.studentId === numberTarget.studentId), "student-number prefix search works");

const grade = options.grades.find((item) => (options.classesByGrade[item] ?? []).length > 1) ?? options.grades[0];
const className = options.classesByGrade[grade][0];
const gradeResults = filters.filterStudentProfiles(profiles, { ...defaultQuery, grade, className: "" });
assert(gradeResults.every((item) => item.currentGrade === grade), "grade filter works");
const classResults = filters.filterStudentProfiles(profiles, { ...defaultQuery, grade, className });
assert(classResults.every((item) => item.currentGrade === grade && item.currentClass === className), "linked class filter works");
assert(options.classesByGrade[grade].every((item) => profiles.some((profile) => profile.currentGrade === grade && profile.currentClass === item)), "class options are scoped to grade");

const activeResults = filters.filterStudentProfiles(profiles, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, hasActiveWarning: ["yes"] },
});
assert(activeResults.length > 0 && activeResults.every((item) => item.hasActiveWarning), "active-warning filter works");
const interventionResults = filters.filterStudentProfiles(profiles, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, hasInterventionHistory: ["yes"] },
});
assert(interventionResults.length > 0 && interventionResults.every((item) => item.hasInterventionHistory), "intervention-history filter works");

const riskValues = [...new Set(defaultResults.flatMap((item) => item.activeRiskLevel ? [item.activeRiskLevel] : []))];
const riskResults = filters.filterStudentProfiles(profiles, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, riskLevel: riskValues.slice(0, 2) },
});
assert(riskResults.every((item) => riskValues.slice(0, 2).includes(item.activeRiskLevel)), "same-category risk options use OR");

const psychologist = options.responsiblePsychologists[0];
const combinedResults = filters.filterStudentProfiles(profiles, {
  ...defaultQuery,
  advanced: {
    ...defaultQuery.advanced,
    hasActiveWarning: ["yes"],
    responsiblePsychologist: [psychologist],
  },
});
assert(combinedResults.every((item) => item.hasActiveWarning && item.currentResponsiblePsychologist === psychologist), "different advanced categories use AND");

const historicalResults = filters.filterStudentProfiles(profiles, {
  ...defaultQuery,
  advanced: { ...defaultQuery.advanced, enrollmentStatus: ["graduated", "left_school"] },
});
assert(historicalResults.length >= 2 && historicalResults.every((item) => item.enrollmentStatus !== "enrolled"), "historical enrollment states use OR");

const cloned = filters.cloneStudentProfileAdvancedFilters(defaultQuery.advanced);
cloned.enrollmentStatus.length = 0;
assert(defaultQuery.advanced.enrollmentStatus[0] === "enrolled", "advanced-filter draft does not mutate applied filters");
assert(types.createDefaultStudentProfileAdvancedFilters().enrollmentStatus[0] === "enrolled", "advanced reset restores enrolled default");

console.log(`student profile regression assertions: ${assertionCount} passed`);
