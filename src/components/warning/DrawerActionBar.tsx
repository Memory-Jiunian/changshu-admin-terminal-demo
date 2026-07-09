import { Button } from "@/components/ui/button";
import type { WarningStatus } from "@/types/warning";

type DrawerActionBarProps = {
  status: WarningStatus;
  actionMessage: string;
  onAction: (label: string) => void;
};

type DrawerAction = {
  label: string;
  emphasis?: "primary" | "secondary";
};

const actionsByStatus: Partial<Record<WarningStatus, DrawerAction[]>> = {
  pending_review: [
    { label: "驳回" },
    { label: "继续观察", emphasis: "secondary" },
    { label: "确认正式预警", emphasis: "primary" },
  ],
  formal_warning: [
    { label: "请求补充反馈" },
    { label: "记录干预", emphasis: "primary" },
  ],
  in_intervention: [
    { label: "新增干预记录", emphasis: "primary" },
    { label: "安排复测" },
    { label: "转介" },
  ],
};

export function DrawerActionBar({ status, actionMessage, onAction }: DrawerActionBarProps) {
  const actions = actionsByStatus[status] ?? [];

  return (
    <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
      {actionMessage ? (
        <div className="mb-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700">
          {actionMessage}
        </div>
      ) : null}

      {actions.length > 0 ? (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              className={
                action.emphasis === "primary"
                  ? "flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "flex-1"
              }
              key={action.label}
              onClick={() => onAction(action.label)}
              type="button"
              variant={action.emphasis === "secondary" ? "secondary" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : (
        <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          当前状态暂无本阶段操作
        </div>
      )}
    </footer>
  );
}
