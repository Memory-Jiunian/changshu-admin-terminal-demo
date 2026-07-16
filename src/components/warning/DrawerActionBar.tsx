import { Button } from "@/components/ui/button";
import {
  getFeedbackActionAvailability,
  getObservationFeedbackActionAvailability,
} from "@/lib/warning-feedback";
import {
  getInterventionAppointmentTiming,
  getLatestPlannedInterventionAppointment,
} from "@/lib/intervention-appointments";
import type { WarningActionType, WarningItem, WarningStatus } from "@/types/warning";

type DrawerActionBarProps = {
  warning: WarningItem;
  currentTime: string;
  actionMessage: string;
  onAction: (action: WarningActionType) => void;
};

type DrawerAction = {
  type: WarningActionType;
  label: string;
  emphasis?: "primary" | "secondary";
  disabled?: boolean;
};

const actionsByStatus: Record<WarningStatus, DrawerAction[]> = {
  pending_review: [
    { type: "end_review", label: "结束本次线索处理" },
    { type: "continue_observation", label: "继续观察", emphasis: "secondary" },
    { type: "confirm_formal_warning", label: "确认正式预警", emphasis: "primary" },
  ],
  observing: [
    { type: "continue_observation", label: "继续观察", emphasis: "secondary" },
    { type: "confirm_formal_warning", label: "确认正式预警", emphasis: "primary" },
    { type: "end_review", label: "结束本次线索处理" },
  ],
  formal_warning: [
    { type: "request_feedback", label: "请求补充反馈" },
    { type: "schedule_intervention", label: "预约干预", emphasis: "primary" },
  ],
  in_intervention: [
    { type: "record_intervention_result", label: "记录干预结果", emphasis: "primary" },
    { type: "cancel_intervention", label: "取消" },
  ],
  pending_retest: [
    { type: "view_retest_result", label: "查看复测结果" },
    { type: "update_retest_status", label: "更新状态", emphasis: "primary" },
  ],
  referral: [
    { type: "add_referral_follow_up", label: "新增转介跟进", emphasis: "primary" },
    { type: "schedule_retest", label: "安排复测" },
  ],
  closed: [{ type: "view_archive", label: "查看归档记录", emphasis: "primary" }],
};

export function DrawerActionBar({ warning, currentTime, actionMessage, onAction }: DrawerActionBarProps) {
  let actions = actionsByStatus[warning.currentStatus];
  if (warning.currentStatus === "observing") {
    const availability = getObservationFeedbackActionAvailability(warning, currentTime);
    actions = [
      {
        type: "continue_observation",
        label: availability.label,
        emphasis: "secondary",
        disabled: availability.disabled,
      },
      { type: "confirm_formal_warning", label: "确认正式预警", emphasis: "primary" },
      { type: "end_review", label: "结束本次线索处理" },
    ];
  }
  if (warning.currentStatus === "formal_warning") {
    const availability = getFeedbackActionAvailability(warning, currentTime);
    const feedbackAction: DrawerAction[] = availability.kind === "hidden"
      ? []
      : [{
          type: "request_feedback",
          label: availability.label,
          disabled: availability.disabled,
        }];
    actions = [
      ...feedbackAction,
      { type: "schedule_intervention", label: "预约干预", emphasis: "primary" },
    ];
  }
  if (warning.currentStatus === "in_intervention") {
    const activeAppointment = getLatestPlannedInterventionAppointment(
      warning.interventionAppointments,
    );
    actions = activeAppointment
      ? [
          { type: "record_intervention_result", label: "记录干预结果", emphasis: "primary" },
          getInterventionAppointmentTiming(activeAppointment, currentTime) === "confirmation_required"
            ? { type: "mark_intervention_no_show", label: "确认未到场并重新预约" }
            : { type: "reschedule_intervention", label: "调整预约" },
          { type: "cancel_intervention", label: "取消" },
        ]
      : [{ type: "schedule_intervention", label: "预约干预", emphasis: "primary" }];
  }
  return (
    <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
      {actionMessage ? (
        <div className="mb-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            className={
              action.emphasis === "primary"
                ? "min-w-28 flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                : "min-w-24 flex-1"
            }
            key={action.type}
            disabled={action.disabled}
            onClick={() => onAction(action.type)}
            type="button"
            variant={action.emphasis === "secondary" ? "secondary" : "outline"}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </footer>
  );
}
