import { Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AttentionMetric } from "@/types/school-overview";

export function SchoolOverviewAttention({ items }: { items: AttentionMetric[] }) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <h2 className="font-semibold text-neutral-950">当前重点关注</h2>
          <p className="mt-0.5 text-xs text-neutral-500">当前事实压力，单位为事项，不代表绩效结论</p>
        </div>
        <span className="text-xs text-neutral-500">{items.some((item) => item.isSuppressed) ? "小数量已隐藏" : `${items.reduce((sum, item) => sum + (item.value ?? 0), 0)} 项`}</span>
      </div>
      <TooltipProvider delayDuration={150}>
        <div className="grid divide-y divide-neutral-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((item) => (
            <div className="flex min-h-[78px] items-center justify-between gap-2 px-4 py-3" key={item.id}>
              <div>
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">{item.displayValue}{item.isSuppressed ? null : <span className="ml-1 text-xs font-normal text-neutral-500">{item.unit}</span>}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="rounded p-1 text-neutral-400 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500" type="button" aria-label={`${item.label}统计口径`}>
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] leading-5" side="top">{item.description}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </Card>
  );
}
