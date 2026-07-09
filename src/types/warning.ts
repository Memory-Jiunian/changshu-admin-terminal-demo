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

export type ClueType =
  | "screening_abnormal"
  | "deep_assessment"
  | "ai_chat"
  | "teacher_report";

export type WarningTimelineItem = {
  id: string;
  title: string;
  operator: string;
  time: string;
  description: string;
};

export type WarningFeedbackRecord = {
  id: string;
  authorRole: string;
  authorName: string;
  content: string;
  submittedAt: string;
};

export type WarningItem = {
  id: string;
  studentName: string;
  gradeClass: string;
  riskLevel: RiskLevel;
  currentStatus: WarningStatus;
  latestActivity: string;
  activityTime: string;
  feedbackStatus: FeedbackStatus;
  responsibleTeacher: string;
  clueType: ClueType;
  assessmentSummary: string;
  aiSummary: string;
  teacherFeedbackSummary: string;
  feedbackRecords: WarningFeedbackRecord[];
  hasUnreadFeedback: boolean;
  timeline: WarningTimelineItem[];
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
  clueType: ClueType[];
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
  clueType: [],
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

export const clueTypeLabels: Record<ClueType, string> = {
  screening_abnormal: "普筛异常",
  deep_assessment: "深度测评",
  ai_chat: "AI倾诉",
  teacher_report: "班主任上报",
};

export const timeRangeLabels: Record<TimeRangeFilter, string> = {
  today: "今日",
  last_3_days: "近 3 天",
  last_7_days: "近 7 天",
};
