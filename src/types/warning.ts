export type WarningStatus =
  | "pending_review"
  | "observing"
  | "formal_warning"
  | "in_intervention"
  | "pending_retest"
  | "referral"
  | "closed";

export type FeedbackStatus =
  | "not_requested"
  | "pending_feedback"
  | "feedback_received"
  | "feedback_overdue"
  | "new_feedback";

export type RiskLevel = "medium" | "high" | "critical";

export type WarningSourceType =
  | "screening_abnormal"
  | "teacher_report"
  | "ai_chat_trigger";

export type WarningEvidenceType =
  | "teacher_report"
  | "ai_chat"
  | "deep_assessment";

export type WarningTimelineItem = {
  id: string;
  title: string;
  operator: string;
  occurredAt: string;
  description: string;
};

export type WarningFeedbackRecord = {
  id: string;
  authorRole: string;
  authorName: string;
  content: string;
  submittedAt: string;
};

export type WarningFeedbackRequestStatus = "pending" | "overdue" | "completed";

export type WarningFeedbackRequest = {
  id: string;
  requestedAt: string;
  requestedBy: string;
  requestNote: string;
  deadline: string;
  status: WarningFeedbackRequestStatus;
};

export type WarningInterventionRecord = {
  id: string;
  occurredAt: string;
  authorName: string;
  method: string;
  summary: string;
  judgment: string;
  followUpPlan: string;
};

export type WarningRetestRecord = {
  id: string;
  arrangedAt: string;
  plannedAt: string;
  scaleIds: string[];
  scaleNames: string[];
  completedAt?: string;
  resultSummary?: string;
  comparison?: string;
  conclusion?: string;
  note?: string;
};

export type WarningDisposition = "active" | "ended_without_warning";

export type WarningReferralRecord = {
  id: string;
  referredAt: string;
  referralType: string;
  organization?: string;
  reason: string;
  resultRecordedAt?: string;
  resultSummary?: string;
};

export type WarningItem = {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  sourceType: WarningSourceType;
  evidenceTypes: WarningEvidenceType[];
  suggestedRiskLevel: RiskLevel;
  confirmedRiskLevel?: RiskLevel;
  riskLevelAdjustmentReason?: string;
  currentStatus: WarningStatus;
  latestActivity: string;
  activityTime: string;
  feedbackStatus: FeedbackStatus;
  responsibleTeacher: string;
  headTeacherName: string;
  headTeacherPhone: string;
  assessmentSummary: string;
  aiSummary: string;
  teacherFeedbackSummary: string;
  feedbackRecords: WarningFeedbackRecord[];
  feedbackRequests: WarningFeedbackRequest[];
  hasUnreadFeedback: boolean;
  interventionRecords: WarningInterventionRecord[];
  retestRecords: WarningRetestRecord[];
  timeline: WarningTimelineItem[];
  isActive: boolean;
  disposition: WarningDisposition;
  endedAt?: string;
  endReason?: string;
  observationNote?: string;
  nextReviewAt?: string;
  feedbackDeadline?: string;
  feedbackRequestNote?: string;
  referralRecords: WarningReferralRecord[];
};

export type ConfirmFormalWarningValues = {
  confirmedRiskLevel: RiskLevel;
  judgmentNote: string;
  riskLevelAdjustmentReason: string;
  feedbackRequestNote: string;
  feedbackDeadline: string;
};

export type WarningActionType =
  | "end_review"
  | "continue_observation"
  | "confirm_formal_warning"
  | "request_feedback"
  | "record_intervention"
  | "add_intervention"
  | "schedule_retest"
  | "start_referral"
  | "view_retest_result"
  | "update_retest_status"
  | "record_referral_result"
  | "view_archive";

export type RetestStatusOutcome = "close" | "continue_intervention" | "referral";

export type WarningActionSubmission =
  | { type: "end_review"; values: { endReason: string } }
  | {
      type: "continue_observation";
      values: { observationNote: string; nextReviewAt: string };
    }
  | {
      type: "request_feedback";
      values: { feedbackRequestNote: string; feedbackDeadline: string };
    }
  | {
      type: "record_intervention" | "add_intervention";
      values: {
        occurredAt: string;
        method: string;
        summary: string;
        judgment: string;
        followUpPlan: string;
      };
    }
  | {
      type: "schedule_retest";
      values: {
        arrangedAt: string;
        plannedAt: string;
        scaleIds: string[];
        scaleNames: string[];
        note: string;
      };
    }
  | {
      type: "start_referral";
      values: { referralType: string; organization: string; reason: string };
    }
  | {
      type: "record_referral_result";
      values: { resultRecordedAt: string; resultSummary: string };
    }
  | { type: "update_retest_status"; values: { outcome: RetestStatusOutcome } };

export type WarningActionResponse = {
  success: boolean;
  message: string;
};

export type StatusTabValue = WarningStatus | "all";

export type QuickFilterValue =
  | "high_risk"
  | "today_new"
  | "feedback_overdue"
  | "mine"
  | "new_feedback";

export type TimeRangeFilter = "today" | "last_3_days" | "last_7_days";

export type AdvancedFilterValues = {
  gradeClass: string[];
  riskLevel: RiskLevel[];
  currentStatus: WarningStatus[];
  evidenceTypes: WarningEvidenceType[];
  responsibleTeacher: string[];
  timeRange: TimeRangeFilter[];
  feedbackStatus: FeedbackStatus[];
};

export type AdvancedFilterKey = keyof AdvancedFilterValues;

export type AdvancedFilterOptions = {
  gradeClass: string[];
  responsibleTeacher: string[];
};

export const emptyAdvancedFilters: AdvancedFilterValues = {
  gradeClass: [],
  riskLevel: [],
  currentStatus: [],
  evidenceTypes: [],
  responsibleTeacher: [],
  timeRange: [],
  feedbackStatus: [],
};

export const statusLabels: Record<StatusTabValue, string> = {
  all: "全部",
  pending_review: "待复核",
  observing: "观察中",
  formal_warning: "正式预警",
  in_intervention: "干预中",
  pending_retest: "待复测",
  referral: "转介中",
  closed: "已闭环",
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  medium: "中风险",
  high: "高风险",
  critical: "危险",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  not_requested: "未请求",
  pending_feedback: "待反馈",
  feedback_received: "已反馈",
  feedback_overdue: "反馈超时",
  new_feedback: "有新反馈",
};

export const warningSourceTypeLabels: Record<WarningSourceType, string> = {
  screening_abnormal: "普筛异常",
  teacher_report: "班主任上报",
  ai_chat_trigger: "AI倾诉主动触发",
};

export const warningEvidenceTypeLabels: Record<WarningEvidenceType, string> = {
  teacher_report: "班主任上报",
  ai_chat: "AI倾诉",
  deep_assessment: "深度测评",
};

export const timeRangeLabels: Record<TimeRangeFilter, string> = {
  today: "今日",
  last_3_days: "近 3 天",
  last_7_days: "近 7 天",
};

export function getEffectiveRiskLevel(warning: WarningItem): RiskLevel {
  return warning.confirmedRiskLevel ?? warning.suggestedRiskLevel;
}
