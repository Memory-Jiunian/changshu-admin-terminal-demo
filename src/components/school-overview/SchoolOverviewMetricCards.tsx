import { AlertTriangle, ClipboardCheck, ShieldAlert, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { SchoolOverviewViewModel } from "@/types/school-overview";

export function SchoolOverviewMetricCards({ viewModel }: { viewModel: SchoolOverviewViewModel }) {
  const coverage = viewModel.coverage.coverageRate;
  const metrics = [
    {
      label: "测评覆盖率",
      value: coverage === null ? "—" : `${coverage}%`,
      detail: `已完成 ${viewModel.coverage.completedCount} 人 / 在校 ${viewModel.coverage.enrolledCount} 人`,
      icon: ClipboardCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "当前确认风险学生",
      value: `${viewModel.currentRisk.studentDisplay}${viewModel.currentRisk.isSuppressed ? "" : " 人"}`,
      detail: "仅统计心理老师确认的中、高、危险风险",
      icon: UsersRound,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "高风险学生",
      value: `${viewModel.currentRisk.highDisplay}${viewModel.currentRisk.isSuppressed ? "" : " 人"}`,
      detail: "当前处理中事项，按学生去重",
      icon: AlertTriangle,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "危险风险学生",
      value: `${viewModel.currentRisk.criticalDisplay}${viewModel.currentRisk.isSuppressed ? "" : " 人"}`,
      detail: "当前处理中事项，按学生去重",
      icon: ShieldAlert,
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <section aria-labelledby="school-overview-metrics-title">
      <h2 className="sr-only" id="school-overview-metrics-title">核心指标</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <Card className="flex min-h-[112px] items-start justify-between p-4 shadow-sm" key={label}>
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="mt-1.5 text-2xl font-semibold text-neutral-950">{value}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{detail}</p>
            </div>
            <div className={`ml-3 rounded-md p-2 ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
          </Card>
        ))}
      </div>
    </section>
  );
}
