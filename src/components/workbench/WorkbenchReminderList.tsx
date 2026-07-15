import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkbenchReminder } from "@/types/workbench";

export function WorkbenchReminderList({ reminders, onOpen }: { reminders: WorkbenchReminder[]; onOpen: (reminder: WorkbenchReminder) => void }) {
  if (!reminders.length) return null;
  return <Card className="overflow-hidden shadow-sm"><div className="border-b border-neutral-200 px-5 py-4"><h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" />今日复测提醒</h2><p className="mt-1 text-xs text-neutral-500">提醒不计入主动待办总数。</p></div>{reminders.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3 last:border-0" key={item.id}><div><div className="font-medium">{item.studentName} · {item.gradeClass}</div><div className="mt-1 text-sm text-neutral-500">{item.plannedAt} · {item.scaleNames.join("、")}</div></div><Button onClick={() => onOpen(item)} size="sm" variant="outline">查看安排</Button></div>)}</Card>;
}
