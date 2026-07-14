import { Button } from "@/components/ui/button";
import type { WarningActionType, WarningStatus } from "@/types/warning";

type DrawerActionBarProps = {
  status: WarningStatus;
  actionMessage: string;
  onAction: (action: WarningActionType) => void;
};

type DrawerAction = {
  type: WarningActionType;
  label: string;
  emphasis?: "primary" | "secondary";
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
    { type: "record_intervention", label: "记录干预", emphasis: "primary" },
  ],
  in_intervention: [
    { type: "add_intervention", label: "新增干预记录", emphasis: "primary" },
    { type: "schedule_retest", label: "安排复测" },
    { type: "start_referral", label: "转介" },
  ],
  pending_retest: [
    { type: "view_retest_result", label: "查看复测结果" },
    { type: "update_retest_status", label: "更新状态", emphasis: "primary" },
  ],
  referral: [
    { type: "record_referral_result", label: "记录转介结果", emphasis: "primary" },
    { type: "schedule_retest", label: "安排复测" },
  ],
  closed: [{ type: "view_archive", label: "查看归档记录", emphasis: "primary" }],
};

export function DrawerActionBar({ status, actionMessage, onAction }: DrawerActionBarProps) {
  return (
    <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
      {actionMessage ? (
        <div className="mb-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="flex gap-2">
        {actionsByStatus[status].map((action) => (
          <Button
            className={
              action.emphasis === "primary"
                ? "flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                : "flex-1"
            }
            key={action.type}
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
