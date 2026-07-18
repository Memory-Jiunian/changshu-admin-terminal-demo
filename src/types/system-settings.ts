import type { EnrollmentHistoryItem, EnrollmentStatus } from "@/types/studentProfile";

export type RecordStatus = "active" | "inactive";
export type SchoolTerm = "first" | "second";

export type SchoolConfig = {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  academicYear: string;
  term: SchoolTerm;
  termStart: string;
  termEnd: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
};

export type SchoolGrade = {
  gradeId: string;
  name: string;
  sortOrder: number;
  status: RecordStatus;
  version: number;
};

export type SchoolClass = {
  classId: string;
  gradeId: string;
  name: string;
  headTeacherId?: string;
  status: RecordStatus;
  version: number;
};

export type TeacherRole =
  | "psychologist"
  | "head_teacher"
  | "grade_director"
  | "principal";

export type SchoolTeacher = {
  teacherId: string;
  staffNumber: string;
  name: string;
  phone?: string;
  roles: TeacherRole[];
  gradeIds: string[];
  classIds: string[];
  status: RecordStatus;
  updatedAt: string;
  version: number;
};

export type SchoolStudent = {
  studentId: string;
  studentNumber: string;
  name: string;
  currentGradeId: string;
  currentClassId: string;
  enrollmentStatus: EnrollmentStatus;
  enrollmentHistory: EnrollmentHistoryItem[];
  updatedAt: string;
  version: number;
};

export type AdminAuditTargetType =
  | "school"
  | "grade"
  | "class"
  | "teacher"
  | "student"
  | "import";

export type AdminAuditLog = {
  id: string;
  action: string;
  targetType: AdminAuditTargetType;
  targetIds: string[];
  operatorId: string;
  operatorName: string;
  occurredAt: string;
  summary: string;
};

export type AdminBaseData = {
  schoolConfig: SchoolConfig;
  grades: SchoolGrade[];
  classes: SchoolClass[];
  teachers: SchoolTeacher[];
  students: SchoolStudent[];
  adminAuditLogs: AdminAuditLog[];
  processedImportIds: string[];
  version: number;
};

export type SystemActionIssue = {
  code: string;
  message: string;
  referenceIds?: string[];
};

export type SystemActionResult<T = AdminBaseData> =
  | { success: true; data: T; message: string }
  | { success: false; issues: SystemActionIssue[]; message: string };

export type SchoolConfigValues = Pick<
  SchoolConfig,
  "schoolName" | "schoolCode" | "academicYear" | "term" | "termStart" | "termEnd"
>;

export type GradeValues = Pick<SchoolGrade, "name" | "sortOrder" | "status">;

export type ClassValues = Pick<
  SchoolClass,
  "gradeId" | "name" | "headTeacherId" | "status"
>;

export type TeacherValues = Omit<
  SchoolTeacher,
  "teacherId" | "updatedAt" | "version"
>;

export type StudentValues = Pick<
  SchoolStudent,
  | "studentNumber"
  | "name"
  | "currentGradeId"
  | "currentClassId"
  | "enrollmentStatus"
>;

export type EnrollmentChangeValues = {
  targetClassId?: string;
  effectiveDate: string;
  changeType: "class_change" | "grade_change" | "graduation" | "left_school";
  note?: string;
};

export type ImportDataType = "organization" | "teacher" | "student";
export type ImportMode = "insert_only" | "upsert";
export type ImportRowResultType =
  | "create"
  | "update"
  | "skip"
  | "warning"
  | "error";

export type ImportCellValue = string | number | boolean | null;
export type ImportRawRow = Record<string, ImportCellValue>;

export type ImportFieldDiff = {
  field: string;
  before?: string;
  after?: string;
};

export type ImportPreviewRow = {
  rowNumber: number;
  naturalKey: string;
  displayName: string;
  resultType: ImportRowResultType;
  normalized: ImportRawRow;
  diffs: ImportFieldDiff[];
  messages: string[];
};

export type ImportPreview = {
  previewId: string;
  dataType: ImportDataType;
  mode: ImportMode;
  sourceFileName: string;
  sourceHash: string;
  baseDataVersion: number;
  createdAt: string;
  confirmedAt?: string;
  rows: ImportPreviewRow[];
  summary: {
    total: number;
    create: number;
    update: number;
    skip: number;
    warning: number;
    error: number;
  };
};

export type ImportCommitOptions = {
  failAtRowNumber?: number;
};

export type SystemSettingsTab =
  | "school"
  | "organization"
  | "teachers"
  | "students"
  | "import";

export const teacherRoleLabels: Record<TeacherRole, string> = {
  psychologist: "心理老师",
  head_teacher: "班主任",
  grade_director: "年级主任",
  principal: "校长",
};

export const recordStatusLabels: Record<RecordStatus, string> = {
  active: "启用",
  inactive: "停用",
};

export const schoolTermLabels: Record<SchoolTerm, string> = {
  first: "第一学期",
  second: "第二学期",
};
