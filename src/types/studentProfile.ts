import type {
  FeedbackStatus,
  RiskLevel,
  WarningSourceType,
  WarningStatus,
} from "@/types/warning";

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

export type StudentProfileRecord = {
  studentId: string;
  studentName: string;
  studentNumber: string;
  currentGrade: string;
  currentClass: string;
  currentHeadTeacher: string;
  enrollmentStatus: EnrollmentStatus;
  updatedAt: string;
  enrollmentHistory: EnrollmentHistoryItem[];
  warningCaseIds: string[];
};

export type StudentProfileSummary = StudentProfileRecord & {
  hasActiveWarning: boolean;
  activeRiskLevel?: RiskLevel;
  activeWarningStatus?: WarningStatus;
  hasInterventionHistory: boolean;
  currentResponsiblePsychologist?: string;
  activeWarningId?: string;
  warningCount: number;
  dataIssues: string[];
};

export type StudentProfileCaseSummary = {
  warningId: string;
  isActive: boolean;
  sourceType: WarningSourceType;
  riskLevel: RiskLevel;
  currentStatus: WarningStatus;
  feedbackStatus: FeedbackStatus;
  responsibleTeacher: string;
  latestActivity: string;
  activityTime: string;
  startedAt: string;
  endedAt?: string;
  outcome: "active" | "closed" | "ended_without_warning";
  outcomeDescription: string;
  feedbackCount: number;
  interventionCount: number;
  retestCount: number;
  referralCount: number;
};

export type StudentProfileDetail = {
  student: StudentProfileRecord;
  summary: StudentProfileSummary;
  activeCase?: StudentProfileCaseSummary;
  historicalCases: StudentProfileCaseSummary[];
  dataIssues: string[];
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

export const enrollmentChangeTypeLabels: Record<EnrollmentChangeType, string> = {
  enrollment: "入学",
  grade_change: "升年级",
  class_change: "转班",
  graduation: "毕业",
  left_school: "离校",
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
