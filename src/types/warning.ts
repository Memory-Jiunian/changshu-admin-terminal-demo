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

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ActiveWarningRiskLevel = Exclude<RiskLevel, "low">;

export type WarningTimelineSourceType =
  | "warning_transition"
  | "feedback_request"
  | "feedback_record"
  | "intervention_appointment"
  | "intervention_record"
  | "retest_record"
  | "referral_record"
  | "referral_follow_up";

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
  sourceType?: WarningTimelineSourceType;
  sourceId?: string;
};

export type WarningFeedbackRecord = {
  id: string;
  requestId?: string;
  authorRole: string;
  authorName: string;
  content: string;
  submittedAt: string;
  psychologistReadAt?: string;
};

export type WarningFeedbackRound = {
  request: WarningFeedbackRequest;
  records: WarningFeedbackRecord[];
};

export type WarningFeedbackCollaboration = {
  rounds: WarningFeedbackRound[];
  proactiveRecords: WarningFeedbackRecord[];
  unmatchedRecords: WarningFeedbackRecord[];
  dataIssues: string[];
};

export type WarningAssessmentDimensionResult = {
  id: string;
  name: string;
  score?: number;
  level?: string;
  summary?: string;
};

export type WarningAssessmentResponseItem = {
  id: string;
  questionText: string;
  answerText: string;
  score?: number;
};

export type WarningDeepAssessmentRecord = {
  id: string;
  scaleId: string;
  scaleName: string;
  startedAt?: string;
  completedAt: string;
  totalScore?: number;
  riskLevel: RiskLevel;
  resultSummary: string;
  dimensions: WarningAssessmentDimensionResult[];
  responses: WarningAssessmentResponseItem[];
  gradeClassAtTime?: string;
};

export type WarningAiConversationMessage = {
  id: string;
  role: "student" | "assistant";
  sentAt: string;
  content: string;
  riskMarker?: string;
};

export type WarningAiConversationRecord = {
  id: string;
  startedAt: string;
  endedAt?: string;
  triggerMessageId?: string;
  summary: string;
  messages: WarningAiConversationMessage[];
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
  appointmentId?: string;
};

export type AppointmentStatus =
  | "planned"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled";

export type WarningInterventionAppointment = {
  id: string;
  plannedAt: string;
  location: string;
  responsibleTeacher: string;
  escortTeacher?: string;
  note?: string;
  status: AppointmentStatus;
  createdAt: string;
  createdBy: string;
  rescheduledFromId?: string;
  notificationOffsetsMinutes: number[];
  cancelledAt?: string;
  cancellationReason?: string;
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
  assessmentRecordId?: string;
  appointmentStatus?: AppointmentStatus;
};

export type WarningDisposition = "active" | "ended_without_warning";

export type WarningReferralFollowUpRecord = {
  id: string;
  occurredAt: string;
  authorName: string;
  summary: string;
  conclusion: string;
};

export type WarningReferralRecord = {
  id: string;
  referredAt: string;
  referralType: string;
  organization?: string;
  reason: string;
  followUpRecords: WarningReferralFollowUpRecord[];
  /** @deprecated Migrated to followUpRecords. */
  resultRecordedAt?: string;
  /** @deprecated Migrated to followUpRecords. */
  resultSummary?: string;
};

export type WarningItem = {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  sourceType: WarningSourceType;
  evidenceTypes: WarningEvidenceType[];
  suggestedRiskLevel: ActiveWarningRiskLevel;
  confirmedRiskLevel?: ActiveWarningRiskLevel;
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
  deepAssessmentRecords: WarningDeepAssessmentRecord[];
  aiConversationRecords: WarningAiConversationRecord[];
  teacherFeedbackSummary: string;
  feedbackRecords: WarningFeedbackRecord[];
  feedbackRequests: WarningFeedbackRequest[];
  hasUnreadFeedback: boolean;
  interventionRecords: WarningInterventionRecord[];
  interventionAppointments: WarningInterventionAppointment[];
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
  confirmedRiskLevel: ActiveWarningRiskLevel;
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
  | "schedule_intervention"
  | "record_intervention_result"
  | "mark_intervention_no_show"
  | "reschedule_intervention"
  | "cancel_intervention"
  | "schedule_retest"
  | "start_referral"
  | "view_retest_result"
  | "update_retest_status"
  | "add_referral_follow_up"
  | "view_archive";

export type RetestStatusOutcome = "close" | "continue_intervention" | "referral";
export type InterventionNextPlan = "continue_intervention" | "schedule_retest" | "referral";

export type InterventionAppointmentValues = {
  plannedAt: string;
  location: string;
  responsibleTeacher: string;
  escortTeacher: string;
  note: string;
  notificationOffsetsMinutes: number[];
};

export type WarningActionSubmission =
  | { type: "end_review"; values: { endReason: string } }
  | {
      type: "continue_observation";
      values: {
        observationNote: string;
        nextReviewAt: string;
        feedbackRequestNote: string;
        feedbackDeadline: string;
      };
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
  | { type: "schedule_intervention"; values: InterventionAppointmentValues }
  | {
      type: "record_intervention_result";
      values: {
        appointmentId: string;
        occurredAt: string;
        method: string;
        summary: string;
        judgment: string;
        nextPlan: InterventionNextPlan;
        nextAppointment?: InterventionAppointmentValues;
        requestFeedback: boolean;
        feedbackRequestNote?: string;
        feedbackDeadline?: string;
        retest?: {
          plannedAt: string;
          scaleIds: string[];
          scaleNames: string[];
          note: string;
        };
        referral?: { referralType: string; organization: string; reason: string };
      };
    }
  | {
      type: "mark_intervention_no_show" | "reschedule_intervention";
      values: { appointmentId: string; appointment: InterventionAppointmentValues };
    }
  | {
      type: "cancel_intervention";
      values: { appointmentId: string; reason: string };
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
      type: "add_referral_follow_up";
      values: { occurredAt: string; authorName: string; summary: string; conclusion: string };
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
  riskLevel: ActiveWarningRiskLevel[];
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
  in_intervention: "待干预",
  pending_retest: "待复测",
  referral: "转介中",
  closed: "已闭环",
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: "低风险",
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

export function getEffectiveRiskLevel(warning: WarningItem): ActiveWarningRiskLevel {
  return warning.confirmedRiskLevel ?? warning.suggestedRiskLevel;
}
