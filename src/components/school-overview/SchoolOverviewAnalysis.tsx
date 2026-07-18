import { AlertCircle, BarChart3, RefreshCw, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { chartColors } from "@/lib/visual-tokens";
import type {
  AssessmentDimensionSummary,
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
      <div className="mb-4 min-h-[58px]">
        <h2 className="flex items-center gap-2 font-semibold text-neutral-950">
          <Icon className="h-4 w-4 text-[var(--icon-default)]" aria-hidden="true" />
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>
      {failed ? <ModuleFailure onRetry={onRetry} /> : children}
    </Card>
  );
}

function ModuleFailure({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center" role="status">
      <AlertCircle className="h-5 w-5 text-[var(--danger-500)]" aria-hidden="true" />
      <p className="mt-2 text-sm font-medium text-neutral-800">本模块加载失败</p>
      <Button className="mt-3 gap-2" onClick={onRetry} size="sm" type="button" variant="outline">
        <RefreshCw className="h-3.5 w-3.5" />重试
      </Button>
    </div>
  );
}

function AssessmentDimensionChart({ items, suppressed }: { items: AssessmentDimensionSummary[]; suppressed: boolean }) {
  if (suppressed) {
    return <div className="flex min-h-[250px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 text-center text-sm text-[var(--text-secondary)]">当前班级为小数量范围，测评维度精确值已隐藏。</div>;
  }
  if (items.length < 3) {
    return <div className="flex min-h-[250px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 text-center text-sm text-[var(--text-secondary)]">当前暂无足够的结构化测评维度数据</div>;
  }

  const max = Math.max(...items.flatMap((item) => [item.assessedStudentCount, item.confirmedRiskStudentCount]), 1);
  const summary = items.map((item) => `${item.label}：全部已测评学生 ${item.assessedStudentCount} 人，当前确认风险学生 ${item.confirmedRiskStudentCount} 人`).join("；");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--primary-200)]" />全部已测评学生</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-blue)]" />当前确认风险学生</span>
        <span className="ml-auto text-[var(--text-tertiary)]">单位：人</span>
      </div>
      <div className="grid h-[250px] gap-2 border-b border-neutral-200 px-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }} role="img" aria-label={`测评突出问题。${summary}`}>
        {items.map((item) => (
          <TooltipProvider delayDuration={150} key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex min-w-0 flex-col items-center justify-end outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" tabIndex={0}>
                  <div className="flex h-[178px] w-full max-w-14 items-end justify-center gap-1">
                    {([
                      [item.assessedStudentCount, "bg-[var(--primary-200)]"],
                      [item.confirmedRiskStudentCount, "bg-[var(--chart-blue)]"],
                    ] as const).map(([value, tone]) => (
                      <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" key={tone}>
                        <span className="mb-1 text-[10px] tabular-nums text-neutral-600">{value}</span>
                        <div className={cn("w-full max-w-5 rounded-t", tone)} style={{ height: `${value === 0 ? 2 : Math.max((value / max) * 142, 10)}px` }} />
                      </div>
                    ))}
                  </div>
                  <span className="mt-2 line-clamp-2 min-h-9 text-center text-[11px] leading-4 text-neutral-600">{item.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px] leading-5">
                <p className="font-medium">{item.label}</p>
                <p>{item.scaleName}</p>
                <p>全部已测评学生 {item.assessedStudentCount} 人；当前确认风险学生 {item.confirmedRiskStudentCount} 人。</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ trends, dataThrough }: { trends: SchoolOverviewTrend[]; dataThrough?: string }) {
  if (trends.some((item) => item.isSuppressed)) {
    return <div className="flex min-h-[250px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 text-center text-sm text-[var(--text-secondary)]">当前班级为小数量范围，历史趋势精确值已隐藏。</div>;
  }
  const max = Math.max(...trends.flatMap((item) => [item.formalWarningCases ?? 0, item.closedCases ?? 0]), 1);
  const summary = trends.map((item) => `${item.label}新增正式预警 ${item.formalWarningCases ?? 0} 项、闭环 ${item.closedCases ?? 0} 项`).join("；");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-blue)]" />新增正式预警事项</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-green)]" />闭环事项</span>
        </div>
        <span className="text-neutral-500">{dataThrough ? `数据截至 ${dataThrough}` : "单位：项"}</span>
      </div>
      <div className="grid h-[250px] grid-cols-6 gap-2 border-b border-neutral-200 px-1" role="img" aria-label={`风险变化趋势，单位项。${summary}`}>
        {trends.map((item) => (
          <div className="flex min-w-0 flex-col items-center justify-end" key={item.month}>
            <div className="flex h-[190px] w-full max-w-14 items-end justify-center gap-1">
              {([
                [item.formalWarningCases ?? 0, "bg-[var(--chart-blue)]", "新增正式预警"],
                [item.closedCases ?? 0, "bg-[var(--chart-green)]", "闭环事项"],
              ] as const).map(([value, tone, label]) => (
                <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" key={label} title={`${item.label}${label} ${value} 项`}>
                  <span className="mb-1 text-[10px] tabular-nums text-neutral-600">{value}</span>
                  <div className={cn("w-full max-w-5 rounded-t", tone)} style={{ height: `${value === 0 ? 2 : Math.max((value / max) * 150, 10)}px` }} />
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

const gradeColors = [
  chartColors.blue,
  chartColors.green,
  chartColors.orange,
  chartColors.purple,
  chartColors.cyan,
];

function GradeRiskDonut({ distribution }: { distribution: GradeRiskDistribution }) {
  if (distribution.isSuppressed) {
    return <div className="flex min-h-[250px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 text-center text-sm text-[var(--text-secondary)]">当前班级为小数量范围，年级构成精确值已隐藏。</div>;
  }
  if (distribution.totalStudentCount === 0) {
    return <div className="flex min-h-[250px] items-center justify-center text-center text-sm text-neutral-500">当前暂无心理老师确认的活动风险学生。</div>;
  }

  let offset = 0;
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-4" aria-label={distribution.accessibleSummary}>
      <div className="relative h-36 w-36" role="img" aria-label={distribution.accessibleSummary}>
        <svg className="h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" fill="none" r="45" stroke="var(--divider)" strokeWidth="15" />
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
        <div className="grid w-full gap-1 sm:grid-cols-2 min-[1360px]:grid-cols-1" role="list" aria-label="风险学生年级分布图例">
          {distribution.items.map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center justify-between gap-2 rounded-md px-2 py-1 text-xs outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-500" role="listitem" tabIndex={0}>
                  <span className="flex min-w-0 items-center gap-2 font-medium text-neutral-800">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: gradeColors[index % gradeColors.length] }} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
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

export function SchoolOverviewAnalysis({ viewModel, failedModules = [], onRetryModule }: { viewModel: SchoolOverviewViewModel; failedModules?: SchoolOverviewModuleKey[]; onRetryModule?: (module: SchoolOverviewModuleKey) => void }) {
  const failed = (module: SchoolOverviewModuleKey) => failedModules.includes(module);
  return (
    <section className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2 min-[1360px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(300px,0.7fr)]" aria-label="校级风险分析">
      <AnalysisCard title="测评突出问题" description="当前学期结构化测评维度中，达到关注阈值人数较多的项目" icon={BarChart3} failed={failed("assessment_dimensions")} onRetry={() => onRetryModule?.("assessment_dimensions")}>
        <AssessmentDimensionChart items={viewModel.highlightedAssessmentDimensions} suppressed={viewModel.isSmallClassSuppressed} />
      </AnalysisCard>

      <AnalysisCard title="风险变化趋势" description="展示本学期新增正式预警与闭环事项的月度变化" icon={TrendingUp} failed={failed("trends")} onRetry={() => onRetryModule?.("trends")}>
        <TrendChart dataThrough={viewModel.trendDataThrough} trends={viewModel.trends} />
      </AnalysisCard>

      <AnalysisCard className="lg:col-span-2 min-[1360px]:col-span-1" title="风险学生年级分布" description="当前确认风险学生按年级的构成" icon={UsersRound} failed={failed("organization")} onRetry={() => onRetryModule?.("organization")}>
        <GradeRiskDonut distribution={viewModel.gradeRiskDistribution} />
      </AnalysisCard>
    </section>
  );
}
