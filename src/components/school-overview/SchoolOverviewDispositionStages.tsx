import { Card } from "@/components/ui/card";
import type { SchoolOverviewViewModel } from "@/types/school-overview";

const stages = [
  { id: "assessmentAndConfirmation", label: "评估与确认", tone: "bg-sky-600" },
  { id: "interventionAndRetest", label: "干预与复测", tone: "bg-amber-500" },
  { id: "externalSupport", label: "校外支持", tone: "bg-violet-600" },
  { id: "closedThisTerm", label: "已闭环", tone: "bg-emerald-600" },
] as const;

export function SchoolOverviewDispositionStages({ viewModel }: { viewModel: SchoolOverviewViewModel }) {
  const values = stages.map((stage) => viewModel.dispositionStages[stage.id] ?? 0);
  const max = Math.max(...values, 1);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5">
        <div>
          <h2 className="font-semibold text-neutral-950">处置阶段概览</h2>
          <p className="mt-0.5 text-xs leading-5 text-neutral-500">横条用于比较事项规模，不代表完成率</p>
        </div>
        <span className="text-xs text-neutral-500">展示内容为本学期</span>
      </div>
      <div className="grid gap-3 bg-neutral-50/70 p-4 sm:grid-cols-2 min-[1180px]:grid-cols-4">
        {stages.map((stage) => {
          const value = viewModel.dispositionStages[stage.id];
          const display = viewModel.dispositionStages.isSuppressed ? "少量" : `${value ?? 0} 项`;
          return (
            <section className="rounded-md border border-neutral-200 bg-white p-4" key={stage.id} aria-label={`${stage.label} ${display}`}>
              <h3 className="text-sm font-medium text-neutral-700">{stage.label}</h3>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-neutral-950">{display}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-200" title={`${stage.label} ${display}`}>
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
