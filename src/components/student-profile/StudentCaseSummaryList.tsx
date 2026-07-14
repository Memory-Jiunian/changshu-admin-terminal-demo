import { Badge } from "@/components/ui/badge";
import type { StudentProfileCaseSummary } from "@/types/studentProfile";
import { riskLevelLabels, warningSourceTypeLabels } from "@/types/warning";

const outcomeLabels = {
  active: "进行中",
  closed: "已闭环",
  ended_without_warning: "结束本次线索处理",
} as const;

export function StudentCaseSummaryList({ cases }: { cases: StudentProfileCaseSummary[] }) {
  return (
    <section className="px-6 py-5">
      <h3 className="text-sm font-semibold text-neutral-950">历史事项摘要</h3>
      {cases.length > 0 ? (
        <div className="mt-4 space-y-3">
          {cases.map((item) => (
            <div className="rounded-lg border border-neutral-200 p-4" key={item.warningId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.warningId}</div>
                  <div className="mt-1 text-xs text-neutral-500">{item.startedAt} 至 {item.endedAt ?? item.activityTime}</div>
                </div>
                <Badge className="shrink-0 bg-neutral-50" variant="outline">{outcomeLabels[item.outcome]}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
                <div><dt className="text-neutral-500">来源</dt><dd className="mt-1 font-medium">{warningSourceTypeLabels[item.sourceType]}</dd></div>
                <div><dt className="text-neutral-500">风险等级</dt><dd className="mt-1 font-medium">{riskLevelLabels[item.riskLevel]}</dd></div>
                <div className="col-span-2"><dt className="text-neutral-500">最终结果 / 结束原因</dt><dd className="mt-1 leading-6 text-neutral-800">{item.outcomeDescription}</dd></div>
              </dl>
              <div className="mt-3 text-xs text-neutral-500">反馈 {item.feedbackCount} · 干预 {item.interventionCount} · 复测 {item.retestCount} · 转介 {item.referralCount}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm text-neutral-500">暂无历史事项。</div>
      )}
    </section>
  );
}
