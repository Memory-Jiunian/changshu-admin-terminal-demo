import { AlertCircle, BarChart3, CircleGauge, GitBranch, RefreshCw, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  DistributionItem,
  GradeRiskDistribution,
  SchoolOverviewModuleKey,
  SchoolOverviewTrend,
  SchoolOverviewViewModel,
} from "@/types/school-overview";

type AnalysisCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  failed?: boolean;
  onRetry?: () => void;
  className?: string;
};

function AnalysisCard({ title, description, icon: Icon, children, failed, onRetry, className }: AnalysisCardProps) {
  return (
    <Card className={cn("min-w-0 p-4 shadow-sm", className)}>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-neutral-950">
          <Icon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
      </div>
      {failed ? <ModuleFailure onRetry={onRetry} /> : children}
    </Card>
  );
}

function ModuleFailure({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center" role="status">
      <AlertCircle className="h-5 w-5 text-neutral-500" aria-hidden="true" />
      <p className="mt-2 text-sm font-medium text-neutral-800">本模块加载失败</p>
      <Button className="mt-3 gap-2" onClick={onRetry} size="sm" type="button" variant="outline">
        <RefreshCw className="h-3.5 w-3.5" />重试
      </Button>
    </div>
  );
}

function DistributionBars({ items, emptyText, compact = false }: { items: DistributionItem[]; emptyText: string; compact?: boolean }) {
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0);
  if (items.some((item) => item.isSuppressed)) {
    return <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">当前班级为小数量范围，精确分布已隐藏。</div>;
  }
  if (total === 0) return <div className="py-10 text-center text-sm text-neutral-500">{emptyText}</div>;

  return (
    <div className={compact ? "grid gap-x-6 gap-y-3 sm:grid-cols-2" : "space-y-4"} role="list">
      {items.map((item, index) => (
        <div key={item.id} role="listitem" aria-label={`${item.label} ${item.displayValue}${item.unit}，占比 ${item.percentage}%`}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-800">{item.label}</span>
            <span className="tabular-nums text-neutral-600">{item.displayValue} {item.unit} · {item.percentage}%</span>
          </div>
          <div className={cn("overflow-hidden rounded-full bg-neutral-100", compact ? "h-2" : "h-2.5")}>
            <div
              className={cn("h-full rounded-full", ["bg-sky-600", "bg-amber-500", "bg-red-600", "bg-violet-600"][index % 4])}
              style={{ width: `${Math.max(item.percentage ?? 0, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const gradeColors = ["#0369a1", "#0f766e", "#b45309", "#be123c", "#6d28d9"];

function GradeRiskDonut({ distribution }: { distribution: GradeRiskDistribution }) {
  if (distribution.isSuppressed) {
    return <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-600">当前班级为小数量范围，年级构成精确值已隐藏。</div>;
  }
  if (distribution.totalStudentCount === 0) {
    return <div className="py-12 text-center text-sm text-neutral-500">当前暂无心理老师确认的活动风险学生。</div>;
  }

  let offset = 0;
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[180px_minmax(0,1fr)]" aria-label={distribution.accessibleSummary}>
      <div className="relative mx-auto h-40 w-40" role="img" aria-label={distribution.accessibleSummary}>
        <svg className="h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" fill="none" r="45" stroke="#e5e7eb" strokeWidth="15" />
          {distribution.items.map((item, index) => {
            const startOffset = offset;
            offset += item.percentage;
            return (
              <circle
                cx="60"
                cy="60"
                fill="none"
                key={item.id}
                pathLength="100"
                r="45"
                stroke={gradeColors[index % gradeColors.length]}
                strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                strokeDashoffset={-startOffset}
                strokeWidth="15"
                transform="rotate(-90 60 60)"
              >
                <title>{item.label}：{item.studentCount} 人，占 {item.percentage}%，其中高及危险 {item.highAndCriticalCount} 人</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-neutral-500">风险学生</span>
          <strong className="mt-0.5 text-xl text-neutral-950">{distribution.totalStudentDisplay} 人</strong>
        </div>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="space-y-2" role="list" aria-label="风险学生年级分布图例">
          {distribution.items.map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-500" role="listitem" tabIndex={0}>
                  <span className="flex min-w-0 items-center gap-2 font-medium text-neutral-800">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: gradeColors[index % gradeColors.length] }} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-600">{item.studentCount} 人 · {item.percentage}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] leading-5" side="top">
                {item.label}：当前风险学生 {item.studentCount} 人，占全部当前风险学生 {item.percentage}%；其中高及危险风险 {item.highAndCriticalCount} 人。
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

function TrendChart({ trends, dataThrough }: { trends: SchoolOverviewTrend[]; dataThrough?: string }) {
  if (trends.some((item) => item.isSuppressed)) {
    return <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-600">当前班级为小数量范围，历史趋势精确值已隐藏。</div>;
  }
  const max = Math.max(...trends.flatMap((item) => [item.formalWarningCases ?? 0, item.closedCases ?? 0]), 1);
  const summary = trends.map((item) => `${item.label}新增正式预警 ${item.formalWarningCases ?? 0} 项、闭环 ${item.closedCases ?? 0} 项`).join("；");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sky-700" />新增正式预警事项</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />闭环事项</span>
        </div>
        {dataThrough ? <span>数据截至 {dataThrough}</span> : null}
      </div>
      <div className="grid h-[210px] grid-cols-6 gap-2 border-b border-neutral-200 px-2" role="img" aria-label={`风险变化趋势，单位项。${summary}`}>
        {trends.map((item) => (
          <div className="flex min-w-0 flex-col items-center justify-end" key={item.month}>
            <div className="flex h-[160px] w-full max-w-14 items-end justify-center gap-1">
              {([
                [item.formalWarningCases ?? 0, "bg-sky-700", "新增正式预警"],
                [item.closedCases ?? 0, "bg-emerald-600", "闭环事项"],
              ] as const).map(([value, tone, label]) => (
                <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" key={label} title={`${item.label}${label} ${value} 项`}>
                  <span className="mb-1 text-[11px] tabular-nums text-neutral-600">{value}</span>
                  <div className={cn("w-full max-w-5 rounded-t", tone)} style={{ height: `${value === 0 ? 2 : Math.max((value / max) * 125, 10)}px` }} />
                </div>
              ))}
            </div>
            <span className="mt-2 text-xs text-neutral-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DispositionEffectiveness({ viewModel }: { viewModel: SchoolOverviewViewModel }) {
  const metric = viewModel.dispositionEffectiveness;
  if (metric.isSuppressed) {
    return <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-600">当前班级为小数量范围，处置成效精确值已隐藏。</div>;
  }
  const items = [
    ["本学期新增正式预警", `${metric.formalWarningDisplay} 项`],
    ["本学期已闭环", `${metric.closedDisplay} 项`],
    ["闭环率", metric.closureRateDisplay],
    ["平均闭环周期", metric.averageClosureDaysDisplay],
  ];
  return (
    <div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3" key={label}>
            <dt className="text-xs text-neutral-500">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-neutral-950">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
        <span className="text-sm font-medium text-amber-950">当前阻塞事项</span>
        <strong className="text-lg text-amber-950">{metric.blockedCaseDisplay} 项</strong>
      </div>
    </div>
  );
}

export function SchoolOverviewAnalysis({ viewModel, failedModules = [], onRetryModule }: { viewModel: SchoolOverviewViewModel; failedModules?: SchoolOverviewModuleKey[]; onRetryModule?: (module: SchoolOverviewModuleKey) => void }) {
  const failed = (module: SchoolOverviewModuleKey) => failedModules.includes(module);
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2" aria-label="校级风险分析">
      <AnalysisCard title="风险等级分布" description={`当前确认风险学生共 ${viewModel.currentRisk.studentDisplay}${viewModel.currentRisk.isSuppressed ? "" : " 人"}`} icon={BarChart3} failed={failed("current_risk")} onRetry={() => onRetryModule?.("current_risk")}>
        <DistributionBars items={viewModel.riskLevelDistribution} emptyText="当前暂无心理老师确认的活动风险事项。" />
      </AnalysisCard>

      <AnalysisCard title="当前处理中 / 本学期已闭环" description={`处理中 ${viewModel.dispositionDistribution.activeCaseDisplay} 项 · 已闭环 ${viewModel.dispositionDistribution.closedThisTermDisplay} 项`} icon={GitBranch} failed={failed("disposition")} onRetry={() => onRetryModule?.("disposition")}>
        <DistributionBars compact items={viewModel.dispositionDistribution.active} emptyText="当前范围暂无正在处理的预警事项。" />
      </AnalysisCard>

      <AnalysisCard title="风险学生年级分布" description="当前确认风险学生按年级的构成，不使用在校学生基数计算风险率" icon={UsersRound} failed={failed("organization")} onRetry={() => onRetryModule?.("organization")}>
        <GradeRiskDonut distribution={viewModel.gradeRiskDistribution} />
      </AnalysisCard>

      <AnalysisCard title="处置成效概览" description="反映本学期正式预警的处理进度，不代表心理老师绩效结论" icon={CircleGauge} failed={failed("effectiveness")} onRetry={() => onRetryModule?.("effectiveness")}>
        <DispositionEffectiveness viewModel={viewModel} />
      </AnalysisCard>

      <AnalysisCard className="lg:col-span-2" title="风险变化趋势" description="展示本学期新增正式预警与闭环事项的月度变化" icon={TrendingUp} failed={failed("trends")} onRetry={() => onRetryModule?.("trends")}>
        <TrendChart dataThrough={viewModel.trendDataThrough} trends={viewModel.trends} />
      </AnalysisCard>
    </section>
  );
}
