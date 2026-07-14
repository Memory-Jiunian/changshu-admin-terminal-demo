import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseTimelineSection({ detail }: { detail: StudentProfileCaseDetail }) {
  if (!detail.timeline.length) {
    return <CaseRecordEmptyState text="暂无处置时间线记录" />;
  }

  return (
    <ol className="space-y-4">
      {detail.timeline.map((item) => (
        <li className="relative border-l border-neutral-200 pl-4" key={item.id}>
          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-neutral-900" />
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="text-sm font-semibold text-neutral-900">{item.title}</div>
            <div className="text-xs text-neutral-500">{item.occurredAt}</div>
          </div>
          <div className="mt-1 text-xs text-neutral-500">{item.operator}</div>
          <div className="mt-2 text-sm leading-6 text-neutral-700">{item.description}</div>
        </li>
      ))}
    </ol>
  );
}
