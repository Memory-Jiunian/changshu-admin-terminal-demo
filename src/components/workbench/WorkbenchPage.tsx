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
const taskTypes: WorkbenchTaskType[] = ["pending_review", "observation_due", "new_feedback", "feedback_overdue", "intervention_unscheduled", "retest_result_pending", "referral_follow_up"];

export function WorkbenchPage({ initialReturnContext, notice, onOpenWarning, loadState = "ready", onRetry }: { initialReturnContext?: WorkbenchReturnContext; notice?: string; onOpenWarning: (target: WorkbenchNavigationTarget) => void; loadState?: "ready" | "loading" | "error"; onRetry?: () => void }) {
  const { warnings } = useAdminData();
  const currentTime = formatMockDateTime();
  const result = useMemo(() => buildWorkbenchItems({ warnings, currentTeacher: CURRENT_TEACHER, currentTime }), [currentTime, warnings]);
  const [selectedTaskType, setSelectedTaskType] = useState<WorkbenchTaskFilter>(initialReturnContext?.selectedTaskType ?? "all");
  const [selectedTaskId, setSelectedTaskId] = useState(initialReturnContext?.selectedTaskId);
  const pageScrollRef = useRef<HTMLElement>(null);
  const taskScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollTop = initialReturnContext?.scrollTop ?? 0;
    if (pageScrollRef.current) pageScrollRef.current.scrollTop = scrollTop;
    if (taskScrollRef.current) taskScrollRef.current.scrollTop = scrollTop;
  }, [initialReturnContext]);
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
  const attentionArrangements = result.reminders.filter((item) => item.state !== "upcoming");
  const upcomingArrangements = result.reminders.filter(
    (item) => item.state === "upcoming" && item.plannedAt.slice(0, 10) === WARNING_MOCK_TODAY,
  );
  const overdueCount = result.tasks.filter((task) => task.isOverdue).length;

  function getReturnContext(taskId?: string): WorkbenchReturnContext {
    const isDesktop = window.matchMedia("(min-width: 1180px)").matches;
    const scrollTop = isDesktop
      ? taskScrollRef.current?.scrollTop ?? 0
      : pageScrollRef.current?.scrollTop ?? 0;
    return { selectedTaskType, scrollTop, selectedTaskId: taskId };
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
    return <section className="mx-auto max-w-[1440px]"><Card className="p-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-[var(--warning-600)]" /><h1 className="mt-3 text-lg font-semibold">工作台加载失败</h1><p className="mt-2 text-sm text-neutral-500">暂时无法读取共享预警数据，请稍后重试。</p>{onRetry ? <Button className="mt-4 gap-2" onClick={onRetry} variant="outline"><RefreshCw className="h-4 w-4" />重新加载</Button> : null}</Card></section>;
  }

  return <section className="scrollbar-hidden grid h-full min-h-0 w-full gap-4 overflow-y-auto min-[1180px]:grid-rows-[auto_auto_minmax(0,1fr)] min-[1180px]:overflow-hidden" ref={pageScrollRef}>
    <div className="shrink-0">
      <header><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">工作台</h1><p className="mt-1 text-sm text-neutral-500">{WARNING_MOCK_TODAY} · 当前心理老师：{CURRENT_TEACHER}</p></div><div className="text-xs text-neutral-500">按时效、风险等级和触发时间进行事实排序</div></div></header>
      {notice ? <div className="mt-3 rounded-md border border-[var(--warning-100)] bg-[var(--warning-50)] px-4 py-3 text-sm text-[var(--warning-600)]">{notice}</div> : null}
    </div>
    <WorkbenchSummary overdueCount={overdueCount} reminderCount={upcomingArrangements.length} taskCount={result.tasks.length + attentionArrangements.length} />
    <div className="grid min-h-0 items-stretch gap-4 min-[1180px]:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          {result.dataIssues.length ? <Card className="border-[var(--warning-100)] bg-[var(--warning-50)] p-4 text-sm text-[var(--warning-600)]"><div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />数据核对提示</div>{result.dataIssues.map((issue) => <div className="mt-1 pl-6" key={issue.id}>{issue.message}</div>)}</Card> : null}
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-sm"><WorkbenchTaskTypeTabs counts={counts} onChange={setSelectedTaskType} value={selectedTaskType} /><div className="shrink-0 flex items-center justify-between border-b border-neutral-100 px-5 py-3 text-sm"><span className="flex items-center gap-2 font-medium"><ListFilter className="h-4 w-4" />当前待办</span><span className="text-xs text-neutral-500">共 {visibleTasks.length} 条 · 仅展示当前心理老师负责事项</span></div><div aria-label="当前待办列表" className="scrollbar-hidden min-[1180px]:min-h-0 min-[1180px]:flex-1 min-[1180px]:overflow-y-auto" ref={taskScrollRef} tabIndex={0}>{visibleTasks.length ? visibleTasks.map((task) => <WorkbenchTaskItem key={task.id} onOpen={openTask} selected={task.id === selectedTaskId} task={task} />) : <div className="px-5 py-12 text-center text-sm text-neutral-500">{result.tasks.length || attentionArrangements.length ? "当前类型暂无待办" : "今日暂无需要主动处理的事项"}</div>}</div></Card>
        </div>
        <WorkbenchReminderList onOpen={openReminder} reminders={result.reminders} />
    </div>
  </section>;
}
