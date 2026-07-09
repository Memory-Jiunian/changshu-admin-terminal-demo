import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DrawerActionBar } from "@/components/warning/DrawerActionBar";
import { FeedbackPanel } from "@/components/warning/FeedbackPanel";
import { ProcessTimeline } from "@/components/warning/ProcessTimeline";
import { RiskEvidence } from "@/components/warning/RiskEvidence";
import {
  riskLevelLabels,
  statusLabels,
  type RiskLevel,
  type WarningItem,
} from "@/types/warning";

type StudentRiskDrawerProps = {
  warning: WarningItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type OverviewItemProps = {
  label: string;
  value: string;
};

const riskBadgeClass: Record<RiskLevel, string> = {
  medium: "border-neutral-200 bg-neutral-100 text-neutral-700",
  high: "border-neutral-300 bg-neutral-900 text-white",
  critical: "border-neutral-900 bg-white text-neutral-950",
};

function OverviewItem({ label, value }: OverviewItemProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}

export function StudentRiskDrawer({
  warning,
  open,
  onOpenChange,
}: StudentRiskDrawerProps) {
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    setActionMessage("");
  }, [warning?.id, open]);

  function handlePlaceholderAction(label: string) {
    if (!warning) {
      return;
    }

    console.log("Phase 3 drawer placeholder:", warning.id, label);
    setActionMessage(`${label} 已触发，本阶段仅做占位反馈。`);
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open && Boolean(warning)}>
      {warning ? (
        <SheetContent className="flex h-full w-[520px] max-w-[calc(100vw-24px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
          <SheetHeader className="shrink-0 border-b border-neutral-200 px-5 py-4 pr-14 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-lg font-semibold text-neutral-950">
                  学生风险详情
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm text-neutral-500">
                  {warning.studentName} · {warning.id}
                </SheetDescription>
              </div>
              <Button
                className="h-8 gap-1"
                onClick={() => handlePlaceholderAction("全屏查看")}
                size="sm"
                type="button"
                variant="outline"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                全屏查看
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden bg-neutral-100">
            <div className="space-y-4 p-5">
              <section className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold text-neutral-950">
                      {warning.studentName}
                    </div>
                    <div className="mt-1 text-sm font-medium text-neutral-500">
                      {warning.gradeClass}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={riskBadgeClass[warning.riskLevel]} variant="outline">
                      {riskLevelLabels[warning.riskLevel]}
                    </Badge>
                    <Badge className="border-neutral-300 bg-neutral-100 text-neutral-800" variant="outline">
                      {statusLabels[warning.currentStatus]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <OverviewItem label="负责心理老师" value={warning.responsibleTeacher} />
                  <OverviewItem label="动态发生时间" value={warning.activityTime} />
                  <div className="col-span-2">
                    <OverviewItem label="最新动态" value={warning.latestActivity} />
                  </div>
                </div>
              </section>

              <RiskEvidence
                onPlaceholderAction={handlePlaceholderAction}
                warning={warning}
              />
              <FeedbackPanel
                onPlaceholderAction={handlePlaceholderAction}
                warning={warning}
              />
              <ProcessTimeline items={warning.timeline} />
            </div>
          </ScrollArea>

          <DrawerActionBar
            actionMessage={actionMessage}
            onAction={handlePlaceholderAction}
            status={warning.currentStatus}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
