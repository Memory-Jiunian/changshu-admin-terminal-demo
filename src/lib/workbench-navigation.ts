import type { WarningItem } from "@/types/warning";
import type {
  WarningDetailNavigationIntent,
  WarningDetailSection,
} from "@/types/workbench";

export function canMarkWorkbenchFeedbackRead({
  intent,
  warning,
  renderedSection,
}: {
  intent?: WarningDetailNavigationIntent;
  warning: WarningItem;
  renderedSection: WarningDetailSection;
}) {
  return Boolean(
    intent?.source === "workbench" &&
      intent.taskType === "new_feedback" &&
      intent.targetSection === "feedback" &&
      renderedSection === "feedback" &&
      intent.warningId === warning.id &&
      warning.hasUnreadFeedback &&
      warning.feedbackRecords.length > 0,
  );
}

export function markWarningFeedbackRead(warning: WarningItem): WarningItem {
  if (!warning.hasUnreadFeedback) return warning;
  return { ...warning, hasUnreadFeedback: false };
}
