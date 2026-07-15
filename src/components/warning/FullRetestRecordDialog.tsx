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

type FullRetestRecordDialogProps = {
  warning: WarningItem | null;
  recordId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Value({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-neutral-800">{value || "-"}</div>
    </div>
  );
}

export function FullRetestRecordDialog({
  warning,
  recordId,
  open,
  onOpenChange,
}: FullRetestRecordDialogProps) {
  const record = warning?.retestRecords.find((item) => item.id === recordId);
  const assessment = warning?.deepAssessmentRecords.find((item) => item.id === record?.assessmentRecordId);
  if (!warning || !record) {
    return null;
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[82vh] max-w-[680px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>完整复测记录</DialogTitle>
          <DialogDescription>
            {warning.studentName} · {warning.id} · 只读
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
          <Value label="安排时间" value={record.arrangedAt} />
          <Value label="计划复测时间" value={record.plannedAt} />
          <Value label="实际完成时间" value={record.completedAt} />
          <Value label="复测量表" value={record.scaleNames.join("、")} />
          <div className="sm:col-span-2"><Value label="结果摘要" value={record.resultSummary} /></div>
          <div className="sm:col-span-2"><Value label="与上次结果对比" value={record.comparison} /></div>
          <div className="sm:col-span-2"><Value label="补充说明" value={record.note} /></div>
          <div className="sm:col-span-2"><Value label="完整作答关联" value={assessment ? assessment.id : record.completedAt ? "未关联完整作答记录" : "复测尚未完成"} /></div>
        </div>
        {assessment ? <div className="space-y-2"><h3 className="text-sm font-semibold text-neutral-900">完整复测作答 · {assessment.scaleName}</h3>{assessment.responses.map((response, index) => <div className="rounded-md border border-neutral-200 p-3 text-sm" key={response.id}><div className="font-medium text-neutral-900">{index + 1}. {response.questionText}</div><div className="mt-1 text-neutral-700">作答：{response.answerText}</div>{response.score !== undefined ? <div className="mt-1 text-xs text-neutral-500">得分：{response.score}</div> : null}</div>)}</div> : null}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
