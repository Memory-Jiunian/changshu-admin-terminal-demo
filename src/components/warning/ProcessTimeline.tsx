import type { WarningTimelineItem } from "@/types/warning";

type ProcessTimelineProps = {
  items: WarningTimelineItem[];
};

export function ProcessTimeline({ items }: ProcessTimelineProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-neutral-950">处置时间线</h3>

      {items.length > 0 ? (
        <ol className="space-y-4">
          {items.map((item, index) => (
            <li className="relative pl-5" key={item.id}>
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-900" />
              {index < items.length - 1 ? (
                <span className="absolute left-[4px] top-4 h-[calc(100%+16px)] w-px bg-neutral-200" />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-950">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">{item.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold text-neutral-500">{item.operator}</div>
                  <div className="mt-1 whitespace-nowrap text-xs text-neutral-400">{item.time}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          暂无处置时间线
        </div>
      )}
    </section>
  );
}
