import { AlertTriangle, ListFilter, RefreshCw } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkbenchReminderList } from "@/components/workbench/WorkbenchReminderList";
import { WorkbenchSummary } from "@/components/workbench/WorkbenchSummary";
import { WorkbenchTaskItem } from "@/components/workbench/WorkbenchTaskItem";
import { WorkbenchTaskTypeTabs } from "@/components/workbench/WorkbenchTaskTypeTabs";
import { buildWorkbenchItems } from "@/lib/workbench-tasks";
import { formatMockDateTime, WARNING_MOCK_TODAY } from "@/lib/warning-time";
import { useAdminData } from "@/state/AdminDataProvider";
import { type WorkbenchNavigationTarget, type WorkbenchReminder, type WorkbenchReturnContext, type WorkbenchTask, type WorkbenchTaskFilter, type WorkbenchTaskType } from "@/types/workbench";

const CURRENT_TEACHER = "陈老师";
const taskTypes: WorkbenchTaskType[] = ["pending_review", "observation_due", "new_feedback", "feedback_overdue", "intervention_unscheduled", "intervention_status_pending", "retest_status_pending", "retest_result_pending", "referral_follow_up"];

export function WorkbenchPage({ initialReturnContext, notice, onOpenWarning, loadState = "ready", onRetry }: { initialReturnContext?: WorkbenchReturnContext; notice?: string; onOpenWarning: (target: WorkbenchNavigationTarget) => void; loadState?: "ready" | "loading" | "error"; onRetry?: () => void }) {
  const { warnings } = useAdminData();
  const currentTime = formatMockDateTime();
  const result = useMemo(() => buildWorkbenchItems({ warnings, currentTeacher: CURRENT_TEACHER, currentTime }), [currentTime, warnings]);
  const [selectedTaskType, setSelectedTaskType] = useState<WorkbenchTaskFilter>(initialReturnContext?.selectedTaskType ?? "all");
  const [selectedTaskId, setSelectedTaskId] = useState(initialReturnContext?.selectedTaskId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = initialReturnContext?.scrollTop ?? 0; }, [initialReturnContext]);
  useEffect(() => {
    if (
      selectedTaskId &&
      !result.tasks.some((task) => task.id === selectedTaskId) &&
      !result.reminders.some((reminder) => reminder.id === selectedTaskId)
    ) {
      setSelectedTaskId(undefined);
    }
  }, [result.reminders, result.tasks, selectedTaskId]);

  const counts = Object.fromEntries(taskTypes.map((type) => [type, result.tasks.filter((task) => task.type === type).length])) as Record<WorkbenchTaskType, number>;
  const visibleTasks = selectedTaskType === "all" ? result.tasks : result.tasks.filter((task) => task.type === selectedTaskType);
  const overdueCount = result.tasks.filter((task) => task.isOverdue).length;

  function getReturnContext(taskId?: string): WorkbenchReturnContext {
    return { selectedTaskType, scrollTop: scrollRef.current?.scrollTop ?? 0, selectedTaskId: taskId };
  }
  function openTask(task: WorkbenchTask) {
    setSelectedTaskId(task.id);
    onOpenWarning({ source: "workbench", warningId: task.warningId, studentId: task.studentId, taskType: task.type, targetSection: task.targetSection, returnContext: getReturnContext(task.id) });
  }
  function openReminder(reminder: WorkbenchReminder) {
    onOpenWarning({ source: "workbench", warningId: reminder.warningId, studentId: reminder.studentId, taskType: reminder.type, targetSection: reminder.targetSection, returnContext: getReturnContext() });
  }

  if (loadState === "loading") {
    return <section className="mx-auto max-w-[1440px] space-y-4" aria-label="工作台加载中"><Skeleton className="h-16 w-full" /><div className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div><Skeleton className="h-80 w-full" /></section>;
  }

  if (loadState === "error") {
    return <section className="mx-auto max-w-[1440px]"><Card className="p-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-3 text-lg font-semibold">工作台加载失败</h1><p className="mt-2 text-sm text-neutral-500">暂时无法读取共享预警数据，请稍后重试。</p>{onRetry ? <Button className="mt-4 gap-2" onClick={onRetry} variant="outline"><RefreshCw className="h-4 w-4" />重新加载</Button> : null}</Card></section>;
  }

  return <section className="mx-auto flex h-[calc(100vh-7rem)] max-w-[1440px] flex-col gap-4 overflow-hidden">
    <header className="shrink-0"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">工作台</h1><p className="mt-1 text-sm text-neutral-500">{WARNING_MOCK_TODAY} · 当前心理老师：{CURRENT_TEACHER}</p></div><div className="text-xs text-neutral-500">按时效、风险等级和触发时间进行事实排序</div></div></header>
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" ref={scrollRef}>
      {notice ? <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</div> : null}
      <WorkbenchSummary overdueCount={overdueCount} reminderCount={result.reminders.length} taskCount={result.tasks.length} />
      <WorkbenchReminderList onOpen={openReminder} reminders={result.reminders} />
      {result.dataIssues.length ? <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />数据核对提示</div>{result.dataIssues.map((issue) => <div className="mt-1 pl-6" key={issue.id}>{issue.message}</div>)}</Card> : null}
      <Card className="overflow-hidden shadow-sm"><WorkbenchTaskTypeTabs counts={counts} onChange={setSelectedTaskType} value={selectedTaskType} /><div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 text-sm"><span className="flex items-center gap-2 font-medium"><ListFilter className="h-4 w-4" />当前待办</span><span className="text-xs text-neutral-500">共 {visibleTasks.length} 条</span></div>{visibleTasks.length ? visibleTasks.map((task) => <WorkbenchTaskItem key={task.id} onOpen={openTask} selected={task.id === selectedTaskId} task={task} />) : <div className="px-5 py-12 text-center text-sm text-neutral-500">{result.tasks.length ? "当前类型暂无待办" : "今日暂无需要主动处理的事项"}</div>}</Card>
    </div>
  </section>;
}
