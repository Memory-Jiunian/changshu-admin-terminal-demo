import { ArrowRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskLevelLabels } from "@/types/warning";
import { workbenchTaskLabels, type WorkbenchTask } from "@/types/workbench";
import { cn } from "@/lib/utils";
import { riskBadgeClasses } from "@/lib/visual-tokens";

export function WorkbenchTaskItem({ task, selected, onOpen }: { task: WorkbenchTask; selected: boolean; onOpen: (task: WorkbenchTask) => void }) {
  return <article className={cn("grid gap-4 border-b border-[var(--divider)] px-5 py-4 last:border-0 lg:grid-cols-[minmax(180px,0.8fr)_minmax(260px,1.5fr)_auto]", selected && "bg-[var(--primary-50)]")}>
    <div><div className="font-semibold text-[var(--text-title)]">{task.studentName}</div><div className="mt-1 text-sm text-[var(--text-secondary)]">{task.gradeClass} · {task.responsibleTeacher}</div><Badge className={cn("mt-2", riskBadgeClasses[task.riskLevel])} variant="outline">{riskLevelLabels[task.riskLevel]}</Badge></div>
    <div><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{workbenchTaskLabels[task.type]}</Badge>{task.isOverdue ? <Badge variant="destructive">已逾期</Badge> : task.isDueToday ? <Badge variant="outline">今天到期</Badge> : null}</div><p className="mt-2 text-sm leading-6 text-neutral-700">{task.reason}</p><div className="mt-2 flex items-center gap-1 text-xs text-neutral-500"><Clock3 className="h-3.5 w-3.5" />{task.dueAt ? `截止 ${task.dueAt}` : `触发 ${task.triggeredAt}`}</div></div>
    <div className="flex items-center"><Button className="gap-1" onClick={() => onOpen(task)} size="sm" type="button" variant="outline">去处理<ArrowRight className="h-3.5 w-3.5" /></Button></div>
  </article>;
}
