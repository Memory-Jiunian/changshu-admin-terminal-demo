import { useEffect, useState } from "react";

import { DETAIL_DRAWER_CLASS } from "@/components/layout/detail-view-config";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ConfirmFormalWarningDialog } from "@/components/warning/ConfirmFormalWarningDialog";
import { WarningDetailContent } from "@/components/warning/WarningDetailContent";
import { WarningDetailFullscreen } from "@/components/warning/WarningDetailFullscreen";
import { cn } from "@/lib/utils";
import type { ConfirmFormalWarningValues, WarningItem } from "@/types/warning";

type StudentRiskDrawerProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmFormalWarning: (
    warningId: string,
    values: ConfirmFormalWarningValues,
  ) => void;
};

export function StudentRiskDrawer({
  warning,
  open,
  onOpenChange,
  onConfirmFormalWarning,
}: StudentRiskDrawerProps) {
  const [actionMessage, setActionMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    setActionMessage("");
    setConfirmDialogOpen(false);
    setFullscreenOpen(false);
  }, [warning?.id, open]);

  function handlePlaceholderAction(label: string) {
    if (!warning) {
      return;
    }

    console.log("Phase 3 drawer placeholder:", warning.id, label);
    setActionMessage(`${label} 已触发，本阶段仅做占位反馈。`);
  }

  function handleConfirm(values: ConfirmFormalWarningValues) {
    if (!warning) {
      return;
    }

    onConfirmFormalWarning(warning.id, values);
    setActionMessage("已确认正式预警，列表和详情已同步更新。");
  }

  function handleCloseDetail() {
    setFullscreenOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open && Boolean(warning)}>
        {warning ? (
          <SheetContent
            className={cn(
              "flex h-full flex-col gap-0 overflow-hidden p-0",
              DETAIL_DRAWER_CLASS,
            )}
          >
            <SheetTitle className="sr-only">学生风险详情</SheetTitle>
            <SheetDescription className="sr-only">
              查看当前学生风险事项及处置记录。
            </SheetDescription>
            <WarningDetailContent
              actionMessage={actionMessage}
              mode="drawer"
              onConfirmFormalWarning={() => setConfirmDialogOpen(true)}
              onOpenFullscreen={() => setFullscreenOpen(true)}
              onPlaceholderAction={handlePlaceholderAction}
              warning={warning}
            />
          </SheetContent>
        ) : null}
      </Sheet>

      <WarningDetailFullscreen
        actionMessage={actionMessage}
        onCloseDetail={handleCloseDetail}
        onConfirmFormalWarning={() => setConfirmDialogOpen(true)}
        onOpenChange={setFullscreenOpen}
        onPlaceholderAction={handlePlaceholderAction}
        open={fullscreenOpen}
        warning={warning}
      />

      <ConfirmFormalWarningDialog
        onConfirm={handleConfirm}
        onOpenChange={setConfirmDialogOpen}
        open={confirmDialogOpen}
        warning={warning}
      />
    </>
  );
}
