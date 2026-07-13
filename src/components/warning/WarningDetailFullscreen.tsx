import { DETAIL_FULLSCREEN_CLASS } from "@/components/layout/detail-view-config";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WarningDetailContent } from "@/components/warning/WarningDetailContent";
import type { WarningItem } from "@/types/warning";

type WarningDetailFullscreenProps = {
  warning: WarningItem | null;
  open: boolean;
  actionMessage: string;
  onOpenChange: (open: boolean) => void;
  onCloseDetail: () => void;
  onPlaceholderAction: (label: string) => void;
  onConfirmFormalWarning: () => void;
};

export function WarningDetailFullscreen({
  warning,
  open,
  actionMessage,
  onOpenChange,
  onCloseDetail,
  onPlaceholderAction,
  onConfirmFormalWarning,
}: WarningDetailFullscreenProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open && Boolean(warning)}>
      {warning ? (
        <DialogContent className={DETAIL_FULLSCREEN_CLASS}>
          <DialogTitle className="sr-only">学生风险详情</DialogTitle>
          <DialogDescription className="sr-only">
            全屏查看当前学生风险事项及处置记录。
          </DialogDescription>
          <WarningDetailContent
            actionMessage={actionMessage}
            mode="fullscreen"
            onCloseDetail={onCloseDetail}
            onConfirmFormalWarning={onConfirmFormalWarning}
            onPlaceholderAction={onPlaceholderAction}
            onReturnToDrawer={() => onOpenChange(false)}
            warning={warning}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
