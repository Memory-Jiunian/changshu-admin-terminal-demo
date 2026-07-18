import { Card } from "@/components/ui/card";
import type { SchoolOverviewViewModel } from "@/types/school-overview";

const stages = [
  { id: "assessmentAndConfirmation", label: "评估与确认", tone: "bg-[var(--chart-blue)]" },
  { id: "interventionAndRetest", label: "干预与复测", tone: "bg-[var(--chart-orange)]" },
  { id: "externalSupport", label: "校外支持", tone: "bg-[var(--chart-purple)]" },
  { id: "closedThisTerm", label: "已闭环", tone: "bg-[var(--chart-green)]" },
] as const;

export function SchoolOverviewDispositionStages({ viewModel }: { viewModel: SchoolOverviewViewModel }) {
  const values = stages.map((stage) => viewModel.dispositionStages[stage.id] ?? 0);
  const max = Math.max(...values, 1);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--divider)] px-5 py-3.5">
        <div>
          <h2 className="font-semibold text-[var(--text-title)]">处置阶段概览</h2>
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">横条用于比较事项规模，不代表完成率</p>
        </div>
        <span className="text-xs text-[var(--text-tertiary)]">展示内容为本学期</span>
      </div>
      <div className="grid gap-3 bg-[var(--bg-subtle)] p-4 sm:grid-cols-2 min-[1180px]:grid-cols-4">
        {stages.map((stage) => {
          const value = viewModel.dispositionStages[stage.id];
          const display = viewModel.dispositionStages.isSuppressed ? "少量" : `${value ?? 0} 项`;
          return (
            <section className="rounded-md border border-[var(--border-default)] bg-[var(--bg-card)] p-4" key={stage.id} aria-label={`${stage.label} ${display}`}>
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">{stage.label}</h3>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-[var(--text-title)]">{display}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--divider)]" title={`${stage.label} ${display}`}>
                <div
                  className={`h-full rounded-full ${stage.tone}`}
                  style={{ width: viewModel.dispositionStages.isSuppressed ? "35%" : `${((value ?? 0) / max) * 100}%` }}
                />
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
