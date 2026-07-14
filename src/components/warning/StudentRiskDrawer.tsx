import { useEffect, useState } from "react";

import { DETAIL_DRAWER_CLASS } from "@/components/layout/detail-view-config";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ArchiveRecordDialog } from "@/components/warning/ArchiveRecordDialog";
import { ConfirmFormalWarningDialog } from "@/components/warning/ConfirmFormalWarningDialog";
import { FullRetestRecordDialog } from "@/components/warning/FullRetestRecordDialog";
import { RetestResultDialog } from "@/components/warning/RetestResultDialog";
import {
  WarningActionDialog,
  type WarningFormActionType,
} from "@/components/warning/WarningActionDialog";
import { WarningDetailContent } from "@/components/warning/WarningDetailContent";
import { WarningDetailFullscreen } from "@/components/warning/WarningDetailFullscreen";
import { cn } from "@/lib/utils";
import type {
  ConfirmFormalWarningValues,
  WarningActionResponse,
  WarningActionSubmission,
  WarningActionType,
  WarningItem,
} from "@/types/warning";

type StudentRiskDrawerProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmFormalWarning: (
    warningId: string,
    values: ConfirmFormalWarningValues,
  ) => void;
  onAction: (
    warningId: string,
    submission: WarningActionSubmission,
  ) => WarningActionResponse;
  currentTime: string;
  onViewFullRetest?: (warningId: string, retestRecordId: string) => void;
  onOpenStudentProfileArchive?: (studentId: string, warningId: string) => void;
};

export function StudentRiskDrawer({
  warning,
  open,
  onOpenChange,
  onConfirmFormalWarning,
  onAction,
  currentTime,
  onViewFullRetest,
}: StudentRiskDrawerProps) {
  const [actionMessage, setActionMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<WarningFormActionType | null>(null);
  const [retestResultOpen, setRetestResultOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [fullRetestRecordId, setFullRetestRecordId] = useState<string | null>(null);

  useEffect(() => {
    setActionMessage("");
    setConfirmDialogOpen(false);
    setFullscreenOpen(false);
    setActiveAction(null);
    setRetestResultOpen(false);
    setArchiveOpen(false);
    setFullRetestRecordId(null);
  }, [warning?.id, open]);

  function handlePlaceholderAction(label: string) {
    if (!warning) {
      return;
    }

    console.log("Warning detail read action:", warning.id, label);
    setActionMessage(`${label} 为只读入口，不写入业务时间线。`);
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

  function handleAction(action: WarningActionType) {
    setActionMessage("");
    if (action === "confirm_formal_warning") {
      setConfirmDialogOpen(true);
      return;
    }
    if (action === "view_retest_result") {
      setRetestResultOpen(true);
      return;
    }
    if (action === "view_archive") {
      setArchiveOpen(true);
      return;
    }
    setActiveAction(action);
  }

  function handleActionSubmit(submission: WarningActionSubmission): WarningActionResponse {
    if (!warning) {
      return { success: false, message: "未找到当前预警事项。" };
    }
    const result = onAction(warning.id, submission);
    if (result.success) {
      setActionMessage(result.message);
      if (submission.type === "end_review") {
        window.setTimeout(() => {
          setFullscreenOpen(false);
          onOpenChange(false);
        }, 600);
      }
    }
    return result;
  }

  function handleViewFullRetest(warningId: string, retestRecordId: string) {
    setRetestResultOpen(false);
    if (onViewFullRetest) {
      onViewFullRetest(warningId, retestRecordId);
      return;
    }
    setFullRetestRecordId(retestRecordId);
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
              currentTime={currentTime}
              mode="drawer"
              onAction={handleAction}
              onOpenFullscreen={() => setFullscreenOpen(true)}
              onPlaceholderAction={handlePlaceholderAction}
              warning={warning}
            />
          </SheetContent>
        ) : null}
      </Sheet>

      <WarningDetailFullscreen
        actionMessage={actionMessage}
        currentTime={currentTime}
        onCloseDetail={handleCloseDetail}
        onAction={handleAction}
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

      <WarningActionDialog
        action={activeAction}
        onOpenChange={(dialogOpen) => {
          if (!dialogOpen) {
            setActiveAction(null);
          }
        }}
        onSubmit={handleActionSubmit}
        open={activeAction !== null}
        warning={warning}
      />

      <RetestResultDialog
        onOpenChange={setRetestResultOpen}
        onViewFullRetest={handleViewFullRetest}
        open={retestResultOpen}
        warning={warning}
      />

      <FullRetestRecordDialog
        onOpenChange={(dialogOpen) => {
          if (!dialogOpen) {
            setFullRetestRecordId(null);
          }
        }}
        open={fullRetestRecordId !== null}
        recordId={fullRetestRecordId}
        warning={warning}
      />

      <ArchiveRecordDialog
        onOpenChange={setArchiveOpen}
        open={archiveOpen}
        warning={warning}
      />
    </>
  );
}
