import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WarningStatus } from "@/types/warning";

type DrawerActionBarProps = {
  status: WarningStatus;
  actionMessage: string;
  onAction: (label: string) => void;
  onConfirmFormalWarning: () => void;
};

type DrawerAction = {
  label: string;
  emphasis?: "primary" | "secondary";
  opensDialog?: boolean;
  opensFormalWarningDialog?: boolean;
};

const actionsByStatus: Record<WarningStatus, DrawerAction[]> = {
  pending_review: [
    { label: "结束本次线索处理" },
    { label: "继续观察", emphasis: "secondary" },
    { label: "确认正式预警", emphasis: "primary", opensFormalWarningDialog: true },
  ],
  observing: [
    { label: "继续观察", emphasis: "secondary" },
    { label: "确认正式预警", emphasis: "primary", opensFormalWarningDialog: true },
    { label: "结束本次线索处理" },
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
  pending_retest: [
    { label: "查看复测结果" },
    { label: "更新状态", emphasis: "primary", opensDialog: true },
  ],
  referral: [
    { label: "记录转介结果", emphasis: "primary" },
    { label: "安排复测" },
  ],
  closed: [{ label: "查看归档记录", emphasis: "primary" }],
};

const retestStatusOptions = ["风险解除并闭环", "继续干预", "转介"];

export function DrawerActionBar({
  status,
  actionMessage,
  onAction,
  onConfirmFormalWarning,
}: DrawerActionBarProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const actions = actionsByStatus[status];

  function handleAction(action: DrawerAction) {
    if (action.opensFormalWarningDialog) {
      onConfirmFormalWarning();
      return;
    }

    if (action.opensDialog) {
      setUpdateDialogOpen(true);
      return;
    }

    onAction(action.label);
  }

  function handleRetestOption(option: string) {
    onAction(`更新状态：${option}`);
    setUpdateDialogOpen(false);
  }

  return (
    <>
      <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
        {actionMessage ? (
          <div className="mb-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700">
            {actionMessage}
          </div>
        ) : null}

        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              className={
                action.emphasis === "primary"
                  ? "flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "flex-1"
              }
              key={action.label}
              onClick={() => handleAction(action)}
              type="button"
              variant={action.emphasis === "secondary" ? "secondary" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </footer>

      <Dialog onOpenChange={setUpdateDialogOpen} open={updateDialogOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>更新复测后状态</DialogTitle>
            <DialogDescription>
              当前为占位弹窗，本阶段只展示可选状态，不修改真实数据。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            {retestStatusOptions.map((option) => (
              <Button
                className="justify-start"
                key={option}
                onClick={() => handleRetestOption(option)}
                type="button"
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
