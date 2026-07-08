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
  timeline: WarningTimelineItem[];
};

export type StatusTabValue = WarningStatus | "all";

export type QuickFilterValue =
  | "high_risk"
  | "today_new"
  | "feedback_overdue"
  | "mine"
  | "new_feedback";

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
  critical: "危急",
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
  ai_chat: "AI 倾诉",
  teacher_report: "班主任上报",
};

