import { AlertCircle, BellRing, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

export function WorkbenchSummary({ taskCount, overdueCount, reminderCount }: { taskCount: number; overdueCount: number; reminderCount: number }) {
  const items = [
    { label: "当前待办", value: taskCount, icon: ClipboardList },
    { label: "逾期事项", value: overdueCount, icon: AlertCircle },
    { label: "今日提醒", value: reminderCount, icon: BellRing },
  ];
  return <div className="grid gap-3 sm:grid-cols-3">{items.map(({ label, value, icon: Icon }) => (
    <Card className="flex items-center justify-between p-4 shadow-sm" key={label}>
      <div><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-2xl font-semibold text-neutral-950">{value}</div></div>
      <div className="rounded-md bg-neutral-100 p-2"><Icon className="h-5 w-5 text-neutral-700" /></div>
    </Card>
  ))}</div>;
}
