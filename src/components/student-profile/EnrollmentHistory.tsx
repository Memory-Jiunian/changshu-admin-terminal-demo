import { Badge } from "@/components/ui/badge";
import { enrollmentChangeTypeLabels, type EnrollmentHistoryItem } from "@/types/studentProfile";

export function EnrollmentHistory({ items }: { items: EnrollmentHistoryItem[] }) {
  const sortedItems = [...items].sort((left, right) => right.startedAt.localeCompare(left.startedAt));

  return (
    <section className="border-b border-neutral-200 px-6 py-5">
      <h3 className="text-sm font-semibold text-neutral-950">学籍动态</h3>
      <div className="mt-4 space-y-3">
        {sortedItems.map((item) => (
          <div className="rounded-lg border border-neutral-200 px-4 py-3" key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{item.grade} / {item.className}</div>
              <Badge className="bg-neutral-50" variant="outline">{enrollmentChangeTypeLabels[item.changeType]}</Badge>
            </div>
            <div className="mt-2 text-xs text-neutral-500">{item.startedAt} 至 {item.endedAt ?? "至今"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
