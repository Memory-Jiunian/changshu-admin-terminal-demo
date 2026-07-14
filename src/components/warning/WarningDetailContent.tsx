import { ArrowLeft, Maximize2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DrawerActionBar } from "@/components/warning/DrawerActionBar";
import { FeedbackPanel } from "@/components/warning/FeedbackPanel";
import { InterventionRecords } from "@/components/warning/InterventionRecords";
import { ProcessTimeline } from "@/components/warning/ProcessTimeline";
import { RetestRecords } from "@/components/warning/RetestRecords";
import { RiskEvidence } from "@/components/warning/RiskEvidence";
import { cn } from "@/lib/utils";
import {
  statusLabels,
  type WarningActionType,
  type WarningItem,
  type WarningStatus,
} from "@/types/warning";

type WarningDetailContentProps = {
  warning: WarningItem;
  mode: "drawer" | "fullscreen";
  actionMessage: string;
  currentTime: string;
  onPlaceholderAction: (label: string) => void;
  onAction: (action: WarningActionType) => void;
  onOpenFullscreen?: () => void;
  onReturnToDrawer?: () => void;
  onCloseDetail?: () => void;
};

type OverviewItemProps = {
  label: string;
  value: string;
};

const interventionStatuses: WarningStatus[] = [
  "in_intervention",
  "pending_retest",
  "referral",
  "closed",
];

function OverviewItem({ label, value }: OverviewItemProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}

function shouldShowFeedback(status: WarningStatus) {
  return status !== "pending_review" && status !== "observing";
}

function shouldShowInterventionRecords(warning: WarningItem) {
  return (
    interventionStatuses.includes(warning.currentStatus) || warning.interventionRecords.length > 0
  );
}

function StudentOverview({ warning }: { warning: WarningItem }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-neutral-950">{warning.studentName}</div>
          <div className="mt-1 text-sm font-medium text-neutral-500">{warning.gradeClass}</div>
        </div>
        <Badge className="border-neutral-300 bg-neutral-100 text-neutral-800" variant="outline">
          {statusLabels[warning.currentStatus]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OverviewItem label="负责心理老师" value={warning.responsibleTeacher} />
        <OverviewItem label="动态发生时间" value={warning.activityTime} />
        <div className="col-span-2">
          <OverviewItem label="最新动态" value={warning.latestActivity} />
        </div>
      </div>
    </section>
  );
}

export function WarningDetailContent({
  warning,
  mode,
  actionMessage,
  currentTime,
  onPlaceholderAction,
  onAction,
  onOpenFullscreen,
  onReturnToDrawer,
  onCloseDetail,
}: WarningDetailContentProps) {
  const isFullscreen = mode === "fullscreen";
  const feedback = shouldShowFeedback(warning.currentStatus) ? (
    <FeedbackPanel currentTime={currentTime} onPlaceholderAction={onPlaceholderAction} warning={warning} />
  ) : null;
  const interventions = shouldShowInterventionRecords(warning) ? (
    <InterventionRecords records={warning.interventionRecords} />
  ) : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-100">
      <header className="shrink-0 border-b border-neutral-200 bg-white px-5 py-4 pr-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">学生风险详情</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {warning.studentName} · {warning.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFullscreen ? (
              <>
                <Button className="h-8 gap-1" onClick={onReturnToDrawer} size="sm" type="button" variant="outline">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  返回抽屉
                </Button>
                <Button className="h-8 gap-1" onClick={onCloseDetail} size="sm" type="button" variant="outline">
                  <X className="h-3.5 w-3.5" />
                  关闭详情
                </Button>
              </>
            ) : (
              <Button className="h-8 gap-1" onClick={onOpenFullscreen} size="sm" type="button" variant="outline">
                <Maximize2 className="h-3.5 w-3.5" />
                全屏查看
              </Button>
            )}
          </div>
        </div>
      </header>

      <ScrollArea className="min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "p-5",
            isFullscreen
              ? "grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              : "space-y-4",
          )}
        >
          {isFullscreen ? (
            <>
              <div className="space-y-4">
                <StudentOverview warning={warning} />
                <RiskEvidence onPlaceholderAction={onPlaceholderAction} warning={warning} />
                {feedback}
              </div>
              <div className="space-y-4">
                {interventions}
                <RetestRecords records={warning.retestRecords} />
                <ProcessTimeline items={warning.timeline} />
              </div>
            </>
          ) : (
            <>
              <StudentOverview warning={warning} />
              <RiskEvidence onPlaceholderAction={onPlaceholderAction} warning={warning} />
              {feedback}
              {interventions}
              <RetestRecords records={warning.retestRecords} />
              <ProcessTimeline items={warning.timeline} />
            </>
          )}
        </div>
      </ScrollArea>

      <DrawerActionBar
        actionMessage={actionMessage}
        currentTime={currentTime}
        onAction={onAction}
        warning={warning}
      />
    </div>
  );
}
