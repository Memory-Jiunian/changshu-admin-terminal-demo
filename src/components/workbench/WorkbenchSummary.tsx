import { AlertCircle, BellRing, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

export function WorkbenchSummary({ taskCount, overdueCount, reminderCount }: { taskCount: number; overdueCount: number; reminderCount: number }) {
  const items = [
    { label: "当前待办", value: taskCount, icon: ClipboardList, tone: "bg-[var(--primary-50)] text-[var(--primary-600)]" },
    { label: "逾期事项", value: overdueCount, icon: AlertCircle, tone: "bg-[var(--danger-50)] text-[var(--danger-600)]" },
    { label: "今日提醒", value: reminderCount, icon: BellRing, tone: "bg-[var(--cyan-50)] text-[var(--cyan-600)]" },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{items.map(({ label, value, icon: Icon, tone }) => (
    <Card className="flex items-center justify-between p-4 shadow-sm" key={label}>
      <div><div className="text-sm text-[var(--text-secondary)]">{label}</div><div className="mt-1 text-2xl font-semibold text-[var(--text-title)]">{value}</div></div>
      <div className={`rounded-md p-2 ${tone}`}><Icon className="h-5 w-5" /></div>
    </Card>
  ))}</div>;
}
