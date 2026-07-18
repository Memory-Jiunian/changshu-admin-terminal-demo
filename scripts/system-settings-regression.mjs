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

const settingsUrl = moduleUrl(compile("src/lib/system-settings.ts"));
const importUrl = moduleUrl(
  compile("src/lib/system-import.ts")
    .replaceAll('"@/lib/system-settings"', `"${settingsUrl}"`),
);
const [settings, systemImport] = await Promise.all([import(settingsUrl), import(importUrl)]);

let assertionCount = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  assertionCount += 1;
}

const context = { operatorId: "T-PSY", operatorName: "陈老师", occurredAt: "2026-07-18 10:00" };
const base = {
  schoolConfig: {
    schoolId: "SCH-1",
    schoolCode: "S-001",
    schoolName: "测试中学",
    academicYear: "2025-2026 学年",
    term: "second",
    termStart: "2026-02-16",
    termEnd: "2026-07-15",
    updatedAt: "2026-07-01 09:00",
    updatedBy: "陈老师",
    version: 1,
  },
  grades: [
    { gradeId: "G-1", name: "初一", sortOrder: 1, status: "active", version: 1 },
    { gradeId: "G-2", name: "初二", sortOrder: 2, status: "active", version: 1 },
  ],
  classes: [
    { classId: "C-1", gradeId: "G-1", name: "1班", headTeacherId: "T-HT", status: "active", version: 1 },
    { classId: "C-2", gradeId: "G-2", name: "1班", status: "active", version: 1 },
  ],
  teachers: [
    { teacherId: "T-PSY", staffNumber: "PSY-1", name: "陈老师", phone: "13800000001", roles: ["psychologist"], gradeIds: [], classIds: [], status: "active", updatedAt: "2026-07-01 09:00", version: 1 },
    { teacherId: "T-HT", staffNumber: "HT-1", name: "王老师", phone: "13800000002", roles: ["head_teacher"], gradeIds: ["G-1"], classIds: ["C-1"], status: "active", updatedAt: "2026-07-01 09:00", version: 1 },
  ],
  students: [
    { studentId: "S-1", studentNumber: "20260001", name: "张同学", currentGradeId: "G-1", currentClassId: "C-1", enrollmentStatus: "enrolled", enrollmentHistory: [{ id: "EH-1", studentId: "S-1", grade: "初一", className: "1班", changeType: "enrollment", startedAt: "2025-09-01" }], updatedAt: "2026-07-01 09:00", version: 1 },
  ],
  adminAuditLogs: [],
  processedImportIds: [],
  version: 1,
};
const warning = {
  id: "WRN-1",
  studentId: "S-1",
  studentName: "张同学",
  isActive: true,
  currentStatus: "formal_warning",
  responsibleTeacher: "陈老师",
  interventionAppointments: [],
  timeline: [{ id: "TL-1", title: "确认正式预警" }],
};

const invalidSchool = settings.updateSchoolConfig(base, { ...base.schoolConfig, termStart: "2026-08-01", termEnd: "2026-07-01" }, context);
assert(!invalidSchool.success && invalidSchool.issues.some((issue) => issue.code === "invalid_term_range"), "invalid term range is blocked");
const schoolUpdate = settings.updateSchoolConfig(base, { ...base.schoolConfig, schoolName: "新校名" }, context);
assert(schoolUpdate.success && schoolUpdate.data.schoolConfig.schoolName === "新校名", "school name updates shared configuration");
assert(schoolUpdate.success && schoolUpdate.data.adminAuditLogs[0].targetType === "school", "school update writes an admin audit");

const duplicateGrade = settings.saveGrade(base, { name: " 初一 ", sortOrder: 9, status: "active" }, context);
assert(!duplicateGrade.success && duplicateGrade.issues[0].code === "duplicate_grade", "grade name is unique after normalization");
const classWrongGrade = settings.saveClass(base, { gradeId: "missing", name: "2班", status: "active" }, context);
assert(!classWrongGrade.success, "class requires an active grade");
const duplicateClass = settings.saveClass(base, { gradeId: "G-1", name: "1班", status: "active" }, context);
assert(!duplicateClass.success && duplicateClass.issues.some((issue) => issue.code === "duplicate_class"), "class name is unique within grade");
const missingHeadTeacher = settings.saveClass(base, { gradeId: "G-1", name: "2班", headTeacherId: "missing", status: "active" }, context);
assert(!missingHeadTeacher.success && missingHeadTeacher.issues.some((issue) => issue.code === "invalid_head_teacher"), "head teacher must be active");
const disableClass = settings.saveClass(base, { ...base.classes[0], status: "inactive" }, context, "C-1", 1);
assert(!disableClass.success && disableClass.issues.some((issue) => issue.code === "class_has_students"), "class with enrolled students cannot be disabled");

const duplicateTeacher = settings.saveTeacher(base, [warning], { ...base.teachers[1], staffNumber: "PSY-1" }, context, "T-HT", 1);
assert(!duplicateTeacher.success && duplicateTeacher.issues.some((issue) => issue.code === "duplicate_staff_number"), "teacher staff number is unique");
const disableHeadTeacher = settings.saveTeacher(base, [], { ...base.teachers[1], status: "inactive" }, context, "T-HT", 1);
assert(!disableHeadTeacher.success && disableHeadTeacher.issues.some((issue) => issue.code === "teacher_is_head_teacher"), "current head teacher cannot be disabled");
const disablePsychologist = settings.saveTeacher(base, [warning], { ...base.teachers[0], status: "inactive" }, context, "T-PSY", 1);
assert(!disablePsychologist.success && disablePsychologist.issues.some((issue) => issue.code === "teacher_owns_active_warnings"), "active warning owner cannot be disabled");
const futureAppointmentWarning = { ...warning, responsibleTeacher: "刘老师", interventionAppointments: [{ id: "IA-1", status: "planned", plannedAt: "2026-07-20 10:00", responsibleTeacher: "陈老师" }] };
const futureIssues = settings.getTeacherDeactivationIssues(base, [futureAppointmentWarning], base.teachers[0], context.occurredAt);
assert(futureIssues.some((issue) => issue.code === "teacher_owns_future_appointments"), "future appointment owner cannot be disabled");

const duplicateStudent = settings.saveStudent(base, { studentNumber: "20260001", name: "李同学", currentGradeId: "G-1", currentClassId: "C-1", enrollmentStatus: "enrolled" }, context);
assert(!duplicateStudent.success && duplicateStudent.issues.some((issue) => issue.code === "duplicate_student_number"), "student number is unique");
const directClassChange = settings.saveStudent(base, { studentNumber: "20260001", name: "张同学", currentGradeId: "G-2", currentClassId: "C-2", enrollmentStatus: "enrolled" }, context, "S-1", 1);
assert(!directClassChange.success && directClassChange.issues.some((issue) => issue.code === "use_enrollment_change"), "class change must use enrollment action");
const transfer = settings.changeStudentEnrollment(base, "S-1", { targetClassId: "C-2", effectiveDate: "2026-07-18", changeType: "grade_change" }, context);
assert(transfer.success && transfer.data.students[0].currentClassId === "C-2", "enrollment action updates current class");
assert(transfer.success && transfer.data.students[0].enrollmentHistory.length === 2, "enrollment action appends history");
assert(transfer.success && transfer.data.students[0].enrollmentHistory.some((item) => item.endedAt === "2026-07-17"), "previous enrollment stage is closed without overwrite");
assert(transfer.success && transfer.data.adminAuditLogs[0].targetType === "student", "enrollment action writes admin audit");
assert(warning.timeline.length === 1, "settings actions never write warning timeline");
const renamedData = {
  ...base,
  teachers: base.teachers.map((teacher) =>
    teacher.teacherId === "T-PSY"
      ? { ...teacher, name: "陈老师（新）" }
      : teacher.teacherId === "T-HT" ? { ...teacher, name: "王老师（新）", phone: "13912345678" } : teacher,
  ),
};
const currentWarningView = settings.buildCurrentWarningViews(renamedData, [{ ...warning, responsibleTeacherId: "T-PSY", headTeacherName: "王老师", headTeacherPhone: "138****0002" }])[0];
assert(currentWarningView.responsibleTeacher === "陈老师（新）", "current warning view reads responsible teacher from stable shared id");
assert(currentWarningView.headTeacherName === "王老师（新）" && currentWarningView.headTeacherPhone === "139****5678", "new collaboration defaults read current class head teacher");
assert(currentWarningView.timeline[0].title === "确认正式预警", "current teacher projection never rewrites historical records");
assert(settings.getSchoolTermRange(base).start === "2026-02-16 00:00", "shared current term produces the overview range");

const organizationRows = [{ 年级名称: "初三", 年级排序: 3, 班级名称: "1班", 班主任工号: "HT-1" }];
const organizationPreview = systemImport.buildImportPreview(base, { dataType: "organization", mode: "upsert", sourceFileName: "org.csv", rows: organizationRows, createdAt: context.occurredAt });
assert(organizationPreview.summary.create === 1 && organizationPreview.summary.error === 0, "organization preview identifies creates");
assert(base.grades.length === 2, "preview never mutates base data");
const badStudentPreview = systemImport.buildImportPreview(base, { dataType: "student", mode: "upsert", sourceFileName: "bad.csv", rows: [{ 学号: "S-2", 姓名: "李同学", 年级: "初一", 班级: "不存在", 在校状态: "在校" }], createdAt: context.occurredAt });
assert(badStudentPreview.summary.error === 1, "invalid organization reference is an import error");
const blockedCommit = systemImport.commitImportPreview(base, [warning], badStudentPreview, context);
assert(!blockedCommit.success && blockedCommit.issues[0].code === "import_has_errors", "error rows block confirmation");

const teacherPreview = systemImport.buildImportPreview(base, { dataType: "teacher", mode: "upsert", sourceFileName: "teacher.csv", rows: [{ 工号: "T-2", 姓名: "刘老师", 手机号: "", 角色: "心理老师", 负责年级: "", 负责班级: "", 状态: "启用" }], createdAt: context.occurredAt });
assert(teacherPreview.summary.warning === 1, "missing phone is a confirmable warning");
const teacherCommit = systemImport.commitImportPreview(base, [warning], teacherPreview, context);
assert(teacherCommit.success && teacherCommit.data.teachers.some((teacher) => teacher.staffNumber === "T-2"), "warning row can be committed");
assert(teacherCommit.success && teacherCommit.data.processedImportIds.includes(teacherPreview.previewId), "confirmed preview is recorded for idempotency");
const duplicateCommit = teacherCommit.success ? systemImport.commitImportPreview(teacherCommit.data, [warning], teacherPreview, context) : null;
assert(duplicateCommit && !duplicateCommit.success && duplicateCommit.issues[0].code === "import_already_confirmed", "confirmed preview cannot be applied twice");

const stalePreview = systemImport.buildImportPreview(base, { dataType: "teacher", mode: "upsert", sourceFileName: "stale.csv", rows: [{ 工号: "T-3", 姓名: "赵老师", 手机号: "13800000003", 角色: "心理老师", 负责年级: "", 负责班级: "", 状态: "启用" }], createdAt: context.occurredAt });
const changedBase = { ...base, version: base.version + 1 };
const staleCommit = systemImport.commitImportPreview(changedBase, [], stalePreview, context);
assert(!staleCommit.success && staleCommit.issues[0].code === "base_data_version_conflict", "stale preview must be regenerated");
const rollback = systemImport.commitImportPreview(base, [], organizationPreview, context, 2);
assert(!rollback.success && base.grades.length === 2 && base.adminAuditLogs.length === 0, "failed import rolls the entire batch back");

const updateTeacherPreview = systemImport.buildImportPreview(base, { dataType: "teacher", mode: "upsert", sourceFileName: "update.csv", rows: [{ 工号: "HT-1", 姓名: "王老师", 手机号: "13900000002", 角色: "班主任", 负责年级: "初一", 负责班级: "初一/1班", 状态: "启用" }], createdAt: context.occurredAt });
assert(updateTeacherPreview.summary.update === 1 && updateTeacherPreview.rows[0].diffs.some((item) => item.field === "手机号"), "upsert preview shows field differences");
const insertOnlyExisting = systemImport.buildImportPreview(base, { dataType: "teacher", mode: "insert_only", sourceFileName: "insert.csv", rows: [{ 工号: "HT-1", 姓名: "王老师", 手机号: "", 角色: "班主任", 负责年级: "", 负责班级: "", 状态: "启用" }], createdAt: context.occurredAt });
assert(insertOnlyExisting.summary.error === 1, "insert-only mode rejects existing natural keys");
const skipPreview = systemImport.buildImportPreview(base, { dataType: "teacher", mode: "upsert", sourceFileName: "same.csv", rows: [{ 工号: "HT-1", 姓名: "王老师", 手机号: "13800000002", 角色: "班主任", 负责年级: "初一", 负责班级: "初一/1班", 状态: "启用" }], createdAt: context.occurredAt });
assert(skipPreview.summary.skip === 1, "identical row is skipped");

const appSource = readFileSync("src/App.tsx", "utf8");
const pageSource = readFileSync("src/components/settings/SystemSettingsPage.tsx", "utf8");
const importPanelSource = readFileSync("src/components/settings/BatchImportPanel.tsx", "utf8");
const providerSource = readFileSync("src/state/AdminDataProvider.tsx", "utf8");
const topbarSource = readFileSync("src/components/layout/Topbar.tsx", "utf8");
const overviewPageSource = readFileSync("src/components/school-overview/SchoolOverviewPage.tsx", "utf8");
const profilePageSource = readFileSync("src/components/student-profile/StudentProfilePage.tsx", "utf8");
assert(appSource.includes("<SystemSettingsPage />"), "settings navigation renders the real page");
assert(["school", "organization", "teachers", "students", "import"].every((tab) => pageSource.includes(`value="${tab}"`)), "settings page exposes all five tabs");
assert(importPanelSource.includes("buildImportPreview") && importPanelSource.includes("commitImportPreview"), "import UI uses preview and atomic commit services");
assert(providerSource.includes("buildStudentProfileRecords(baseData, warnings)"), "student profile data derives from shared master data");
assert(providerSource.includes("getSchoolTermRange") === false, "provider does not duplicate school overview selectors");
assert(topbarSource.includes("baseData.schoolConfig.schoolName"), "topbar reads the shared school name");
assert(overviewPageSource.includes("getSchoolTermRange(baseData)"), "school overview reads the shared current term");
assert(profilePageSource.includes("baseData.schoolConfig.schoolId") && profilePageSource.includes("currentOperator.teacherId"), "student class preference is isolated by shared school and teacher ids");

console.log(`system settings regression: ${assertionCount} assertions passed`);
