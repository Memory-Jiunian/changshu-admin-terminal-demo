import type { WarningItem } from "@/types/warning";
import type {
  WarningDetailNavigationIntent,
} from "@/types/workbench";
import { hasUnreadWarningFeedback } from "@/lib/warning-feedback";

export function shouldProtectWorkbenchFeedbackClose({
  intent,
  warning,
}: {
  intent?: WarningDetailNavigationIntent;
  warning: WarningItem;
}) {
  return Boolean(
    intent?.source === "workbench" &&
      intent.taskType === "new_feedback" &&
      intent.targetSection === "feedback" &&
      intent.warningId === warning.id &&
      hasUnreadWarningFeedback(warning),
  );
}
