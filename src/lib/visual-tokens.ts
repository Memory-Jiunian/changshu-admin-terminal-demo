import type { FeedbackStatus, RiskLevel, WarningStatus } from "@/types/warning";

export const riskBadgeClasses: Record<RiskLevel, string> = {
  low: "border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
  medium: "border-[var(--primary-100)] bg-[var(--primary-50)] text-[var(--primary-600)]",
  high: "border-[var(--warning-100)] bg-[var(--warning-50)] text-[var(--warning-600)]",
  critical: "border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]",
};

export const warningStatusBadgeClasses: Record<WarningStatus, string> = {
  pending_review: "border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
  observing: "border-[var(--purple-100)] bg-[var(--purple-50)] text-[var(--purple-600)]",
  formal_warning: "border-[var(--warning-100)] bg-[var(--warning-50)] text-[var(--warning-600)]",
  in_intervention: "border-[var(--primary-100)] bg-[var(--primary-50)] text-[var(--primary-600)]",
  pending_retest: "border-[var(--cyan-100)] bg-[var(--cyan-50)] text-[var(--cyan-600)]",
  referral: "border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]",
  closed: "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-600)]",
};

export const feedbackBadgeClasses: Record<FeedbackStatus, string> = {
  not_requested: "border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-tertiary)]",
  pending_feedback: "border-[var(--primary-100)] bg-[var(--primary-50)] text-[var(--primary-600)]",
  feedback_received: "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-600)]",
  feedback_overdue: "border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]",
  new_feedback: "border-[var(--purple-100)] bg-[var(--purple-50)] text-[var(--purple-600)]",
};

export const chartColors = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  orange: "var(--chart-orange)",
  purple: "var(--chart-purple)",
  cyan: "var(--chart-cyan)",
  red: "var(--chart-red)",
} as const;
