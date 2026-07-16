import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WarningItem } from "@/types/warning";
import { getLatestCompletedRetest } from "@/lib/warning-retests";

type RetestResultDialogProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewFullRetest: (warningId: string, retestRecordId: string) => void;
};

function Value({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-neutral-800">{value || "-"}</div>
    </div>
  );
}

export function RetestResultDialog({ warning, open, onOpenChange, onViewFullRetest }: RetestResultDialogProps) {
  if (!warning) {
    return null;
  }
  const record = getLatestCompletedRetest(warning);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>查看复测结果</DialogTitle>
          <DialogDescription>{warning.studentName} · 最近一次复测记录</DialogDescription>
        </DialogHeader>
        {!record ? (
          <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-6 text-center text-sm text-neutral-500">复测尚未完成</div>
        ) : (
          <div className="grid gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
            <Value label="计划复测时间" value={record.plannedAt} />
            <Value label="实际完成时间" value={record.completedAt} />
            <div className="sm:col-span-2"><Value label="复测量表" value={record.scaleNames.join("、")} /></div>
            <div className="sm:col-span-2"><Value label="结果摘要" value={record.resultSummary} /></div>
            <div className="sm:col-span-2"><Value label="与上次结果对比" value={record.comparison} /></div>
          </div>
        )}
        <DialogFooter>
          {record ? (
            <Button
              onClick={() => onViewFullRetest(warning.id, record.id)}
              type="button"
              variant="outline"
            >
              查看完整复测记录
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)} type="button">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
