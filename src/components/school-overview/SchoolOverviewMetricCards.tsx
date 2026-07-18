import { ClipboardCheck, Info, ShieldAlert, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SchoolOverviewViewModel } from "@/types/school-overview";

function DetailMetric({ label, value, unit }: { label: string; value: string; unit: "人" | "项" }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs leading-5 text-neutral-500">{label}</dt>
      <dd className="mt-1 whitespace-nowrap text-xl font-semibold tabular-nums text-neutral-950">
        {value}<span className="ml-1 text-xs font-normal text-neutral-500">{unit}</span>
      </dd>
    </div>
  );
}

export function SchoolOverviewMetricCards({ viewModel }: { viewModel: SchoolOverviewViewModel }) {
  const coverage = viewModel.coverage.coverageRate;
  const attention = viewModel.attentionSummary;

  return (
    <section aria-labelledby="school-overview-metrics-title">
      <h2 className="sr-only" id="school-overview-metrics-title">核心概览</h2>
      <div className="grid items-stretch gap-3 lg:grid-cols-2 min-[1360px]:grid-cols-[minmax(280px,0.8fr)_minmax(440px,1.2fr)_minmax(440px,1.2fr)]">
        <Card className="flex min-h-[180px] flex-col justify-between p-5 shadow-sm lg:col-span-2 min-[1360px]:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-neutral-950">测评覆盖率</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">当前学期有效测评，按学生去重</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-700"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /></div>
          </div>
          <div>
            <p className="text-3xl font-semibold tabular-nums text-neutral-950">{coverage === null ? "暂无可计算数据" : `${coverage}%`}</p>
            <dl className="mt-5 grid grid-cols-2 gap-5">
              <DetailMetric label="全部在校学生" unit="人" value={String(viewModel.coverage.enrolledCount)} />
              <DetailMetric label="已测评" unit="人" value={String(viewModel.coverage.completedCount)} />
            </dl>
          </div>
        </Card>

        <Card className="flex min-h-[180px] flex-col justify-between p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-neutral-950">确认风险学生</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">仅使用心理老师确认等级，按学生去重</p>
            </div>
            <div className="rounded-md bg-sky-50 p-2 text-sky-700"><UsersRound className="h-5 w-5" aria-hidden="true" /></div>
          </div>
          <div>
            <p className="text-3xl font-semibold tabular-nums text-neutral-950">{viewModel.currentRisk.studentDisplay}{viewModel.currentRisk.isSuppressed ? "" : " 人"}</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              <DetailMetric label="中风险学生" unit="人" value={viewModel.currentRisk.mediumDisplay} />
              <DetailMetric label="高风险学生" unit="人" value={viewModel.currentRisk.highDisplay} />
              <DetailMetric label="危险风险学生" unit="人" value={viewModel.currentRisk.criticalDisplay} />
            </dl>
          </div>
        </Card>

        <Card className="flex min-h-[180px] flex-col justify-between p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-neutral-950">当前需关注</p>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="rounded p-0.5 text-neutral-400 outline-none hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-500" type="button" aria-label="当前需关注统计说明">
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] leading-5">不同关注类型可能存在重叠，总数按事项编号去重。</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="mt-1 text-xs leading-5 text-neutral-500">管理关注事项，不代表专业处置建议</p>
            </div>
            <div className="rounded-md bg-amber-50 p-2 text-amber-700"><ShieldAlert className="h-5 w-5" aria-hidden="true" /></div>
          </div>
          <div>
            <p className="text-3xl font-semibold tabular-nums text-neutral-950">{attention.totalDisplay}{attention.isSuppressed ? "" : " 项"}</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              <DetailMetric label="转介中" unit="项" value={attention.referralDisplay} />
              <DetailMetric label="积压处置" unit="项" value={attention.backlogDisplay} />
              <DetailMetric label="协作阻塞" unit="项" value={attention.collaborationBlockedDisplay} />
            </dl>
          </div>
        </Card>
      </div>
    </section>
  );
}
