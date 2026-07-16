import { useState, type ReactNode } from "react";
import { AlertCircle, BarChart3, Building2, GitBranch, RefreshCw, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  DistributionItem,
  OrganizationRiskRow,
  SchoolOverviewModuleKey,
  SchoolOverviewTrend,
  SchoolOverviewTrendMetric,
  SchoolOverviewViewModel,
} from "@/types/school-overview";

type AnalysisCardProps = {
  title: string;
  description: string;
  icon: typeof BarChart3;
  children: ReactNode;
  failed?: boolean;
  onRetry?: () => void;
  className?: string;
};

function AnalysisCard({ title, description, icon: Icon, children, failed, onRetry, className }: AnalysisCardProps) {
  return (
    <Card className={cn("min-w-0 p-4 shadow-sm", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-neutral-950"><Icon className="h-4 w-4 text-neutral-500" aria-hidden="true" />{title}</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
        </div>
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
      <Button className="mt-3 gap-2" onClick={onRetry} size="sm" type="button" variant="outline"><RefreshCw className="h-3.5 w-3.5" />重试</Button>
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
          <div className={cn("flex items-center justify-between text-sm", compact ? "mb-1" : "mb-1.5")}>
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

function OrganizationRows({ rows }: { rows: OrganizationRiskRow[] }) {
  if (rows.length === 0) return <div className="py-10 text-center text-sm text-neutral-500">当前范围暂无可展示的组织数据。</div>;
  return (
    <div className="divide-y divide-neutral-100">
      <div className="hidden grid-cols-[minmax(80px,1.2fr)_repeat(5,minmax(72px,1fr))] gap-3 px-2 pb-2 text-xs text-neutral-500 md:grid">
        <span>组织</span><span>在校学生</span><span>确认风险</span><span>风险占比</span><span>中 / 高 / 危险</span><span>隐私状态</span>
      </div>
      {rows.map((row) => (
        <div className="grid gap-2 px-2 py-3 text-sm md:grid-cols-[minmax(80px,1.2fr)_repeat(5,minmax(72px,1fr))] md:items-center md:gap-3" key={row.id} aria-label={row.accessibleSummary}>
          <span className="font-medium text-neutral-900">{row.label}</span>
          <span className="text-neutral-600"><span className="md:hidden">在校：</span>{row.enrolledCount} 人</span>
          <span className="text-neutral-600"><span className="md:hidden">确认风险：</span>{row.riskStudentDisplay}{row.isSuppressed ? "" : " 人"}</span>
          <span className="text-neutral-600"><span className="md:hidden">占比：</span>{row.riskRateDisplay}</span>
          <span className="text-neutral-600"><span className="md:hidden">等级：</span>{row.isSuppressed ? "已隐藏" : `${row.mediumCount} / ${row.highCount} / ${row.criticalCount}`}</span>
          <span className="text-xs text-neutral-500">{row.isSuppressed ? "小数量保护" : "可展示"}</span>
        </div>
      ))}
    </div>
  );
}

const trendOptions: Array<{ id: SchoolOverviewTrendMetric; label: string; unit: "人" | "项" }> = [
  { id: "confirmedRiskStudents", label: "新增确认风险学生", unit: "人" },
  { id: "formalWarningCases", label: "新增正式预警", unit: "项" },
  { id: "closedCases", label: "闭环事项", unit: "项" },
  { id: "referralCases", label: "新发起转介", unit: "项" },
];

function TrendChart({ trends }: { trends: SchoolOverviewTrend[] }) {
  const [metric, setMetric] = useState<SchoolOverviewTrendMetric>("confirmedRiskStudents");
  const selected = trendOptions.find((item) => item.id === metric)!;
  const values = trends.map((item) => item[metric]);
  if (trends.some((item) => item.isSuppressed)) {
    return <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-600">当前班级为小数量范围，历史趋势精确值已隐藏。</div>;
  }
  const max = Math.max(...values.map((value) => value ?? 0), 1);

  return (
    <div>
      <div className="scrollbar-hidden mb-4 flex gap-1 overflow-x-auto" role="tablist" aria-label="趋势指标">
        {trendOptions.map((item) => (
          <button
            aria-selected={metric === item.id}
            className={cn("shrink-0 rounded-md px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-neutral-500", metric === item.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")}
            key={item.id}
            onClick={() => setMetric(item.id)}
            role="tab"
            type="button"
          >{item.label}</button>
        ))}
      </div>
      <div className="grid h-[190px] grid-cols-6 gap-2 border-b border-neutral-200 px-2" role="img" aria-label={`${selected.label}当前学期按月趋势，单位${selected.unit}`}>
        {trends.map((item) => {
          const value = item[metric] ?? 0;
          return (
            <div className="flex min-w-0 flex-col items-center justify-end" key={item.month}>
              <span className="mb-1 text-xs tabular-nums text-neutral-600">{value}</span>
              <div className="w-full max-w-10 rounded-t bg-sky-600" style={{ height: `${value === 0 ? 2 : Math.max((value / max) * 135, 10)}px` }} />
              <span className="mt-2 text-xs text-neutral-500">{item.label}</span>
            </div>
          );
        })}
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

      <AnalysisCard title="处置进程分布" description={`活动事项 ${viewModel.dispositionDistribution.activeCaseDisplay}，当前学期闭环 ${viewModel.dispositionDistribution.closedThisTermDisplay}`} icon={GitBranch} failed={failed("disposition")} onRetry={() => onRetryModule?.("disposition")}>
        <DistributionBars compact items={viewModel.dispositionDistribution.active} emptyText="当前范围暂无活动预警事项。" />
        <div className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">当前学期已闭环：<strong className="text-neutral-900">{viewModel.dispositionDistribution.closedThisTermDisplay}</strong>{viewModel.dispositionDistribution.isSuppressed ? null : " 项"}，不与活动事项共用百分比分母。</div>
      </AnalysisCard>

      <AnalysisCard className="lg:col-span-2" title={viewModel.scope.organizationFilter.level === "school" ? "年级风险分布" : "班级风险分布"} description="默认按风险占比、危险人数和高风险人数排序；班级小数量在统计层遮蔽" icon={Building2} failed={failed("organization")} onRetry={() => onRetryModule?.("organization")}>
        <OrganizationRows rows={viewModel.organizationDistribution} />
      </AnalysisCard>

      <AnalysisCard title="当前学期趋势" description="按真实业务事件时间归月；趋势变化不代表因果结论" icon={TrendingUp} failed={failed("trends")} onRetry={() => onRetryModule?.("trends")}>
        <TrendChart trends={viewModel.trends} />
      </AnalysisCard>

      <AnalysisCard title="风险线索来源分布" description="来源表示事项最初发现渠道，不等于风险原因" icon={BarChart3} failed={failed("sources")} onRetry={() => onRetryModule?.("sources")}>
        <DistributionBars items={viewModel.sourceDistribution} emptyText="当前暂无可统计的确认风险事项来源。" />
      </AnalysisCard>
    </section>
  );
}
