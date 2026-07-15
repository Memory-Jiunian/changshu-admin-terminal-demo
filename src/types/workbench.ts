import type { RiskLevel } from "@/types/warning";

export type WorkbenchTaskType =
  | "pending_review"
  | "observation_due"
  | "new_feedback"
  | "feedback_overdue"
  | "retest_result_pending"
  | "referral_follow_up"
  | "intervention_unscheduled"
  | "intervention_status_pending"
  | "retest_status_pending";

export type WorkbenchReminderType = "retest_plan_today" | "intervention_plan_upcoming";

export type WarningDetailSection =
  | "overview"
  | "risk_evidence"
  | "feedback"
  | "intervention"
  | "retest"
  | "referral"
  | "action_bar";

export type WorkbenchTask = {
  id: string;
  kind: "task";
  type: WorkbenchTaskType;
  warningId: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  riskLevel: RiskLevel;
  responsibleTeacher: string;
  reason: string;
  triggeredAt: string;
  dueAt?: string;
  isOverdue: boolean;
  isDueToday: boolean;
  targetSection: WarningDetailSection;
};

export type WorkbenchReminder = {
  id: string;
  kind: "reminder";
  type: WorkbenchReminderType;
  warningId: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  riskLevel: RiskLevel;
  responsibleTeacher: string;
  reason: string;
  plannedAt: string;
  scaleNames?: string[];
  location?: string;
  targetSection: "retest" | "intervention";
};

export type WorkbenchDataIssue = {
  id: string;
  warningId?: string;
  message: string;
};

export type WorkbenchResult = {
  tasks: WorkbenchTask[];
  reminders: WorkbenchReminder[];
  dataIssues: WorkbenchDataIssue[];
};

export type WorkbenchTaskFilter = WorkbenchTaskType | "all";

export type WorkbenchReturnContext = {
  selectedTaskType: WorkbenchTaskFilter;
  scrollTop: number;
  selectedTaskId?: string;
};

export type WorkbenchNavigationTarget = {
  source: "workbench";
  warningId: string;
  studentId: string;
  taskType: WorkbenchTaskType | WorkbenchReminderType;
  targetSection: WarningDetailSection;
  returnContext: WorkbenchReturnContext;
};

export type WarningDetailNavigationIntent = Omit<WorkbenchNavigationTarget, "returnContext">;

export const warningDetailSections: WarningDetailSection[] = [
  "overview",
  "risk_evidence",
  "feedback",
  "intervention",
  "retest",
  "referral",
  "action_bar",
];

export const workbenchTaskLabels: Record<WorkbenchTaskType, string> = {
  pending_review: "待复核",
  observation_due: "观察到期",
  new_feedback: "有新反馈",
  feedback_overdue: "反馈超时",
  retest_result_pending: "复测结果待更新",
  referral_follow_up: "转介跟进中",
  intervention_unscheduled: "待安排干预",
  intervention_status_pending: "干预情况待确认",
  retest_status_pending: "复测情况待确认",
};

export const workbenchTaskSections: Record<WorkbenchTaskType, WarningDetailSection> = {
  pending_review: "risk_evidence",
  observation_due: "action_bar",
  new_feedback: "feedback",
  feedback_overdue: "feedback",
  retest_result_pending: "retest",
  referral_follow_up: "referral",
  intervention_unscheduled: "action_bar",
  intervention_status_pending: "intervention",
  retest_status_pending: "retest",
};

export const workbenchReminderSections: Record<WorkbenchReminderType, "retest" | "intervention"> = {
  retest_plan_today: "retest",
  intervention_plan_upcoming: "intervention",
};
