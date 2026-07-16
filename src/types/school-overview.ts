import type { EnrollmentStatus } from "@/types/studentProfile";
import type { RiskLevel, WarningSourceType, WarningStatus } from "@/types/warning";

export type SchoolOverviewTermRange = {
  label: string;
  start: string;
  end: string;
};

export type SchoolOverviewOrganizationFilter =
  | { level: "school" }
  | { level: "grade"; grade: string }
  | { level: "class"; grade: string; className: string };

export type SchoolOverviewScope = {
  termRange: SchoolOverviewTermRange;
  organizationFilter: SchoolOverviewOrganizationFilter;
  organizationLabel: string;
};

export type SchoolOverviewDataIssueCode =
  | "multiple_active_cases"
  | "low_active_warning_risk"
  | "missing_confirmed_risk"
  | "missing_student"
  | "missing_grade_class"
  | "intervention_without_appointment"
  | "retest_without_plan"
  | "feedback_state_mismatch"
  | "coverage_overflow"
  | "missing_formal_warning_time"
  | "invalid_closure_cycle";

export type SchoolOverviewModuleKey =
  | "coverage"
  | "current_risk"
  | "attention"
  | "organization"
  | "disposition"
  | "trends"
  | "sources"
  | "effectiveness";

export type SchoolOverviewDataIssue = {
  code: SchoolOverviewDataIssueCode;
  module: SchoolOverviewModuleKey;
  message: string;
  affectedCount: number | null;
};

export type AssessmentCoverageMetric = {
  enrolledCount: number;
  completedCount: number;
  incompleteCount: number;
  coverageRate: number | null;
};

export type CurrentRiskMetric = {
  studentCount: number | null;
  studentDisplay: string;
  highCount: number | null;
  highDisplay: string;
  criticalCount: number | null;
  criticalDisplay: string;
  isSuppressed: boolean;
};

export type DistributionItem = {
  id: string;
  label: string;
  value: number | null;
  displayValue: string;
  unit: "人" | "项";
  percentage: number | null;
  isSuppressed: boolean;
};

export type AttentionMetricId =
  | "critical_risk"
  | "feedback_read_unscheduled"
  | "intervention_confirmation_required"
  | "feedback_overdue"
  | "retest_overdue_incomplete"
  | "referral";

export type AttentionMetricGroup = "immediate" | "backlog" | "collaboration";

export type AttentionMetric = {
  id: AttentionMetricId;
  group: AttentionMetricGroup;
  label: string;
  value: number | null;
  displayValue: string;
  unit: "人" | "项";
  description: string;
  isSuppressed: boolean;
};

export type OrganizationRiskRow = {
  id: string;
  label: string;
  level: "grade" | "class";
  enrolledCount: number;
  riskStudentCount: number | null;
  riskStudentDisplay: string;
  riskRate: number | null;
  riskRateDisplay: string;
  mediumCount: number | null;
  highCount: number | null;
  criticalCount: number | null;
  isSuppressed: boolean;
  accessibleSummary: string;
};

export type DispositionDistribution = {
  active: DistributionItem[];
  activeCaseCount: number | null;
  activeCaseDisplay: string;
  closedThisTermCount: number | null;
  closedThisTermDisplay: string;
  isSuppressed: boolean;
};

export type SchoolOverviewTrend = {
  month: string;
  label: string;
  formalWarningCases: number | null;
  closedCases: number | null;
  isSuppressed: boolean;
};

export type SchoolOverviewTrendMetric =
  | "formalWarningCases"
  | "closedCases";

export type GradeRiskDistributionItem = {
  id: string;
  label: string;
  studentCount: number;
  percentage: number;
  highAndCriticalCount: number;
};

export type GradeRiskDistribution = {
  totalStudentCount: number | null;
  totalStudentDisplay: string;
  items: GradeRiskDistributionItem[];
  isSuppressed: boolean;
  accessibleSummary: string;
};

export type DispositionEffectiveness = {
  formalWarningCount: number | null;
  formalWarningDisplay: string;
  closedCount: number | null;
  closedDisplay: string;
  closureRate: number | null;
  closureRateDisplay: string;
  averageClosureDays: number | null;
  averageClosureDaysDisplay: string;
  blockedCaseCount: number | null;
  blockedCaseDisplay: string;
  isSuppressed: boolean;
};

export type SchoolOverviewFilterOptions = {
  grades: string[];
  classesByGrade: Record<string, string[]>;
};

export type SchoolOverviewViewModel = {
  scope: SchoolOverviewScope;
  updatedAt: string;
  coverage: AssessmentCoverageMetric;
  currentRisk: CurrentRiskMetric;
  attention: AttentionMetric[];
  riskLevelDistribution: DistributionItem[];
  organizationDistribution: OrganizationRiskRow[];
  dispositionDistribution: DispositionDistribution;
  trends: SchoolOverviewTrend[];
  trendDataThrough?: string;
  gradeRiskDistribution: GradeRiskDistribution;
  dispositionEffectiveness: DispositionEffectiveness;
  sourceDistribution: DistributionItem[];
  filterOptions: SchoolOverviewFilterOptions;
  dataIssues: SchoolOverviewDataIssue[];
  hasAssessmentData: boolean;
  hasConfirmedRisk: boolean | null;
  hasScopeData: boolean;
  isSmallClassSuppressed: boolean;
};

export type SchoolOverviewStudentInput = {
  studentId: string;
  currentGrade: string;
  currentClass: string;
  enrollmentStatus: EnrollmentStatus;
};

export const schoolRiskLevelLabels: Record<Exclude<RiskLevel, "low">, string> = {
  medium: "中风险",
  high: "高风险",
  critical: "危险",
};

export const schoolWarningStatusLabels: Record<WarningStatus, string> = {
  pending_review: "待复核",
  observing: "观察中",
  formal_warning: "正式预警",
  in_intervention: "待干预",
  pending_retest: "待复测",
  referral: "转介中",
  closed: "已闭环",
};

export const schoolWarningSourceLabels: Record<WarningSourceType, string> = {
  screening_abnormal: "普筛异常",
  ai_chat_trigger: "AI 倾诉触发",
  teacher_report: "班主任上报",
};
