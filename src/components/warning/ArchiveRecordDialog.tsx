import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessTimeline } from "@/components/warning/ProcessTimeline";
import { riskLevelLabels, type WarningItem } from "@/types/warning";

type ArchiveRecordDialogProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ArchiveRecordDialog({ warning, open, onOpenChange }: ArchiveRecordDialogProps) {
  if (!warning) {
    return null;
  }
  const sortedTimeline = [...warning.timeline].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt),
  );
  const startedAt = sortedTimeline[0]?.occurredAt || "-";
  const closedAt = warning.timeline.find((item) => item.title === "完成闭环归档")?.occurredAt || "-";
  const finalResult = warning.retestRecords
    .filter((record) => record.conclusion)
    .sort((left, right) => right.arrangedAt.localeCompare(left.arrangedAt))[0]?.conclusion || "已完成闭环归档";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex h-[82vh] max-w-[760px] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-neutral-200 px-6 py-5 pr-14">
          <DialogTitle>归档记录</DialogTitle>
          <DialogDescription>{warning.studentName} · {warning.id} · 只读</DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 bg-neutral-100">
          <div className="space-y-4 p-5">
            <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-3">
              <div><div className="text-xs font-semibold text-neutral-500">学生信息</div><div className="mt-1 text-sm font-medium">{warning.studentName} · {warning.gradeClass}</div></div>
              <div><div className="text-xs font-semibold text-neutral-500">正式确认等级</div><div className="mt-1 text-sm font-medium">{warning.confirmedRiskLevel ? riskLevelLabels[warning.confirmedRiskLevel] : "-"}</div></div>
              <div><div className="text-xs font-semibold text-neutral-500">事项开始时间</div><div className="mt-1 text-sm font-medium">{startedAt}</div></div>
              <div><div className="text-xs font-semibold text-neutral-500">闭环时间</div><div className="mt-1 text-sm font-medium">{closedAt}</div></div>
              <div><div className="text-xs font-semibold text-neutral-500">干预 / 复测次数</div><div className="mt-1 text-sm font-medium">{warning.interventionRecords.length} / {warning.retestRecords.length}</div></div>
              <div><div className="text-xs font-semibold text-neutral-500">转介记录</div><div className="mt-1 text-sm font-medium">{warning.referralRecords.length} 条</div></div>
              <div className="sm:col-span-3"><div className="text-xs font-semibold text-neutral-500">最终结果</div><div className="mt-1 text-sm leading-6 text-neutral-800">{finalResult}</div></div>
            </section>
            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-950">转介记录</h3>
                <span className="text-xs font-medium text-neutral-500">共 {warning.referralRecords.length} 条</span>
              </div>
              {warning.referralRecords.length > 0 ? (
                <div className="space-y-2">
                  {[...warning.referralRecords]
                    .sort((left, right) => right.referredAt.localeCompare(left.referredAt))
                    .map((record) => (
                      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm" key={record.id}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-neutral-900">{record.referralType}</span>
                          <span className="text-xs text-neutral-500">{record.referredAt}</span>
                        </div>
                        <p className="mt-2 text-neutral-700">转介机构：{record.organization || "-"}</p>
                        <p className="mt-1 text-neutral-700">转介原因：{record.reason}</p>
                        <p className="mt-1 text-neutral-700">结果摘要：{record.resultSummary || "尚未记录"}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">暂无转介记录</div>
              )}
            </section>
            <ProcessTimeline items={warning.timeline} />
          </div>
        </ScrollArea>
        <DialogFooter className="shrink-0 border-t border-neutral-200 bg-white px-6 py-4">
          <Button onClick={() => onOpenChange(false)} type="button">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
