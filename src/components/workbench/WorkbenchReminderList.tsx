import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkbenchReminder } from "@/types/workbench";

export function WorkbenchReminderList({ reminders, onOpen }: { reminders: WorkbenchReminder[]; onOpen: (reminder: WorkbenchReminder) => void }) {
  return <Card className="flex max-h-[calc(100vh-15rem)] min-w-0 flex-col overflow-hidden shadow-sm min-[1180px]:sticky min-[1180px]:top-0">
    <div className="shrink-0 border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" />今日 / 近期安排</h2>
        <Badge variant="secondary">{reminders.length}</Badge>
      </div>
      <p className="mt-1 text-xs leading-5 text-neutral-500">待确认和未完成项优先；今日提醒仅统计普通 upcoming 安排。</p>
    </div>
    <div className="min-h-0 overflow-y-auto p-3">
      {reminders.length ? <div className="space-y-2.5">{reminders.map((item) => {
        const isAttention = item.state !== "upcoming";
        const arrangementType = item.type === "intervention_plan_upcoming" ? "干预预约" : "复测安排";
        const arrangementDetail = item.type === "intervention_plan_upcoming"
          ? item.location || "地点待确认"
          : item.scaleNames?.join("、") || "量表待确认";

        return <article className={cn("rounded-md border p-3", isAttention ? "border-amber-200 bg-amber-50/60" : "border-neutral-200 bg-white")} key={item.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><div className="truncate text-sm font-semibold text-neutral-950">{item.studentName}</div><div className="mt-0.5 text-xs text-neutral-500">{item.gradeClass}</div></div>
            <Badge className="shrink-0" variant={isAttention ? "outline" : "secondary"}>{arrangementType}</Badge>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-start justify-between gap-3"><span className="text-neutral-500">计划时间</span><span className="text-right font-medium text-neutral-800">{item.plannedAt}</span></div>
            <div className="flex items-start justify-between gap-3"><span className="text-neutral-500">事实状态</span><span className={cn("text-right font-medium", isAttention ? "text-amber-800" : "text-neutral-700")}>{item.statusLabel}</span></div>
            <div className="flex items-start justify-between gap-3"><span className="text-neutral-500">安排内容</span><span className="max-w-[65%] text-right text-neutral-700">{arrangementDetail}</span></div>
          </div>
          <Button className="mt-3 w-full" onClick={() => onOpen(item)} size="sm" variant="outline">{item.ctaLabel}</Button>
        </article>;
      })}</div> : <div className="px-4 py-12 text-center text-sm text-neutral-500">今日及近期暂无安排</div>}
    </div>
  </Card>;
}
