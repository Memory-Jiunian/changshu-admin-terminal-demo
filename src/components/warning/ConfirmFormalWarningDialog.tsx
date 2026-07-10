import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  riskLevelLabels,
  type ConfirmFormalWarningValues,
  type RiskLevel,
  type WarningItem,
} from "@/types/warning";

type ConfirmFormalWarningDialogProps = {
  open: boolean;
  warning: WarningItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: ConfirmFormalWarningValues) => void;
};

const riskLevels: RiskLevel[] = ["medium", "high", "critical"];

export function ConfirmFormalWarningDialog({
  open,
  warning,
  onOpenChange,
  onConfirm,
}: ConfirmFormalWarningDialogProps) {
  const [confirmedRiskLevel, setConfirmedRiskLevel] = useState<RiskLevel | null>(null);
  const [judgmentNote, setJudgmentNote] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setConfirmedRiskLevel(null);
      setJudgmentNote("");
      setAdjustmentReason("");
      setErrorMessage("");
    }
  }, [open, warning?.id]);

  if (!warning) {
    return null;
  }

  const riskLevelChanged =
    confirmedRiskLevel !== null && confirmedRiskLevel !== warning.suggestedRiskLevel;

  function handleSubmit() {
    if (!confirmedRiskLevel) {
      setErrorMessage("请选择正式风险等级。");
      return;
    }

    if (riskLevelChanged && adjustmentReason.trim().length === 0) {
      setErrorMessage("正式等级与系统提示不同时，必须填写调整理由。");
      return;
    }

    onConfirm({
      confirmedRiskLevel,
      judgmentNote: judgmentNote.trim(),
      riskLevelAdjustmentReason: riskLevelChanged ? adjustmentReason.trim() : "",
    });
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>确认正式预警</DialogTitle>
          <DialogDescription>
            {warning.studentName} · {warning.gradeClass}。请由负责心理老师确认正式风险等级。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3">
            <div className="text-xs font-semibold text-neutral-500">系统提示风险等级</div>
            <Badge className="mt-2 border-neutral-300 bg-white text-neutral-900" variant="outline">
              {riskLevelLabels[warning.suggestedRiskLevel]}
            </Badge>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              系统提示仅供参考，正式风险等级必须由心理老师确认。
            </p>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-neutral-900">
              正式风险等级 <span className="text-red-600">*</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {riskLevels.map((riskLevel) => {
                const isSelected = confirmedRiskLevel === riskLevel;

                return (
                  <Button
                    aria-pressed={isSelected}
                    className={cn(
                      "border-neutral-200",
                      isSelected && "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800",
                    )}
                    key={riskLevel}
                    onClick={() => {
                      setConfirmedRiskLevel(riskLevel);
                      setErrorMessage("");
                    }}
                    type="button"
                    variant="outline"
                  >
                    {riskLevelLabels[riskLevel]}
                  </Button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-neutral-900">判断说明（选填）</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              onChange={(event) => setJudgmentNote(event.target.value)}
              placeholder="记录本次专业判断的补充说明"
              value={judgmentNote}
            />
          </label>

          {riskLevelChanged ? (
            <label className="block">
              <span className="text-sm font-semibold text-neutral-900">
                风险等级调整理由 <span className="text-red-600">*</span>
              </span>
              <textarea
                className="mt-2 min-h-20 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                onChange={(event) => {
                  setAdjustmentReason(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="说明为何与系统提示等级不同"
                value={adjustmentReason}
              />
            </label>
          ) : null}

          {errorMessage ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            取消
          </Button>
          <Button
            className="bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={handleSubmit}
            type="button"
          >
            确认正式预警
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
