import { Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AttentionMetric, AttentionMetricGroup } from "@/types/school-overview";

const groups: Array<{ id: AttentionMetricGroup; label: string; tone: string }> = [
  { id: "immediate", label: "需要立即关注", tone: "border-red-200 bg-red-50/60" },
  { id: "backlog", label: "处置存在积压", tone: "border-amber-200 bg-amber-50/60" },
  { id: "collaboration", label: "协作存在阻塞", tone: "border-sky-200 bg-sky-50/60" },
];

export function SchoolOverviewAttention({ items }: { items: AttentionMetric[] }) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <h2 className="font-semibold text-neutral-950">当前重点关注</h2>
          <p className="mt-0.5 text-xs text-neutral-500">当前事实压力，人数与事项数分别标注，不代表绩效结论</p>
        </div>
        <span className="text-xs text-neutral-500">{items.some((item) => item.isSuppressed) ? "小数量已隐藏" : "按最新共享数据派生"}</span>
      </div>
      <TooltipProvider delayDuration={150}>
        <div className="grid gap-3 p-3 lg:grid-cols-3">
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group.id);
            return (
              <section className={`rounded-md border p-3 ${group.tone}`} key={group.id} aria-labelledby={`attention-${group.id}`}>
                <h3 className="text-xs font-semibold text-neutral-700" id={`attention-${group.id}`}>{group.label}</h3>
                <div className="mt-2 divide-y divide-neutral-200/70">
                  {groupItems.map((item) => (
                    <div className="flex min-h-[58px] items-center justify-between gap-2 py-2" key={item.id}>
                      <div>
                        <p className="text-xs text-neutral-600">{item.label}</p>
                        <p className="mt-0.5 text-lg font-semibold text-neutral-950">{item.displayValue}{item.isSuppressed ? null : <span className="ml-1 text-xs font-normal text-neutral-500">{item.unit}</span>}</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="rounded p-1 text-neutral-500 outline-none hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-neutral-500" type="button" aria-label={`${item.label}统计口径`}>
                            <Info className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] leading-5" side="top">{item.description}</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </TooltipProvider>
    </Card>
  );
}
