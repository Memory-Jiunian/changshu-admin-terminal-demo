import type { RiskLevel, WarningStatus } from "@/types/warning";

export type EnrollmentStatus = "enrolled" | "graduated" | "left_school";

export type EnrollmentChangeType =
  | "enrollment"
  | "grade_change"
  | "class_change"
  | "graduation"
  | "left_school";

export type EnrollmentHistoryItem = {
  id: string;
  studentId: string;
  grade: string;
  className: string;
  changeType: EnrollmentChangeType;
  startedAt: string;
  endedAt?: string;
};

export type StudentProfileSummary = {
  studentId: string;
  studentName: string;
  studentNumber: string;
  currentGrade: string;
  currentClass: string;
  currentHeadTeacher: string;
  currentResponsiblePsychologist?: string;
  enrollmentStatus: EnrollmentStatus;
  hasActiveWarning: boolean;
  activeRiskLevel?: RiskLevel;
  activeWarningStatus?: WarningStatus;
  hasInterventionHistory: boolean;
  updatedAt: string;
};

export type StudentProfile = StudentProfileSummary & {
  enrollmentHistory: EnrollmentHistoryItem[];
  caseIds: string[];
};

export type BooleanFilterValue = "yes" | "no";

export type StudentProfileAdvancedFilters = {
  riskLevel: RiskLevel[];
  warningStatus: WarningStatus[];
  hasActiveWarning: BooleanFilterValue[];
  hasInterventionHistory: BooleanFilterValue[];
  responsiblePsychologist: string[];
  enrollmentStatus: EnrollmentStatus[];
};

export type StudentProfileAdvancedFilterKey = keyof StudentProfileAdvancedFilters;

export type StudentProfileFilterQuery = {
  keyword: string;
  grade: string;
  className: string;
  advanced: StudentProfileAdvancedFilters;
};

export type StudentProfileFilterOptions = {
  grades: string[];
  classesByGrade: Record<string, string[]>;
  responsiblePsychologists: string[];
};

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  enrolled: "在校",
  graduated: "已毕业",
  left_school: "已离校",
};

export const booleanFilterLabels: Record<BooleanFilterValue, string> = {
  yes: "是",
  no: "否",
};

export function createDefaultStudentProfileAdvancedFilters(): StudentProfileAdvancedFilters {
  return {
    riskLevel: [],
    warningStatus: [],
    hasActiveWarning: [],
    hasInterventionHistory: [],
    responsiblePsychologist: [],
    enrollmentStatus: ["enrolled"],
  };
}
