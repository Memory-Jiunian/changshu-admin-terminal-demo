import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UnreadFeedbackCloseDialog({
  open,
  busy,
  onContinue,
  onClosePreservingTask,
  onMarkReadAndClose,
}: {
  open: boolean;
  busy: boolean;
  onContinue: () => void;
  onClosePreservingTask: () => void;
  onMarkReadAndClose: () => void;
}) {
  return (
    <Dialog onOpenChange={(nextOpen) => !nextOpen && onContinue()} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>反馈尚未标记为已查看</DialogTitle>
          <DialogDescription className="leading-6">
            你还没有确认查看本次班主任反馈。关闭后，“有新反馈”待办会继续保留。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button disabled={busy} onClick={onContinue} type="button" variant="outline">
            继续查看
          </Button>
          <Button disabled={busy} onClick={onClosePreservingTask} type="button" variant="outline">
            关闭并保留待办
          </Button>
          <Button disabled={busy} onClick={onMarkReadAndClose} type="button">
            标记已查看并关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
