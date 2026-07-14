import { Badge } from "@/components/ui/badge";
import type { StudentProfileCaseSummary } from "@/types/studentProfile";
import { riskLevelLabels, statusLabels, warningSourceTypeLabels } from "@/types/warning";

export function StudentActiveCase({ activeCase }: { activeCase?: StudentProfileCaseSummary }) {
  return (
    <section className="border-b border-neutral-200 px-6 py-5">
      <h3 className="text-sm font-semibold text-neutral-950">当前活动事项</h3>
      {activeCase ? (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-neutral-950">{activeCase.warningId}</div>
            <Badge className="bg-white" variant="outline">{statusLabels[activeCase.currentStatus]}</Badge>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
            <div><dt className="text-neutral-500">来源类型</dt><dd className="mt-1 font-medium">{warningSourceTypeLabels[activeCase.sourceType]}</dd></div>
            <div><dt className="text-neutral-500">当前风险</dt><dd className="mt-1 font-medium">{riskLevelLabels[activeCase.riskLevel]}</dd></div>
            <div><dt className="text-neutral-500">当前状态</dt><dd className="mt-1 font-medium">{statusLabels[activeCase.currentStatus]}</dd></div>
            <div><dt className="text-neutral-500">负责心理老师</dt><dd className="mt-1 font-medium">{activeCase.responsibleTeacher}</dd></div>
            <div><dt className="text-neutral-500">事项开始时间</dt><dd className="mt-1 font-medium">{activeCase.startedAt}</dd></div>
            <div><dt className="text-neutral-500">最近动态时间</dt><dd className="mt-1 font-medium">{activeCase.activityTime}</dd></div>
            <div className="col-span-2"><dt className="text-neutral-500">最近动态</dt><dd className="mt-1 leading-6 text-neutral-800">{activeCase.latestActivity}</dd></div>
          </dl>
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-neutral-200 pt-4 text-center text-xs">
            <div><div className="text-lg font-semibold">{activeCase.feedbackCount}</div><div className="text-neutral-500">反馈</div></div>
            <div><div className="text-lg font-semibold">{activeCase.interventionCount}</div><div className="text-neutral-500">干预</div></div>
            <div><div className="text-lg font-semibold">{activeCase.retestCount}</div><div className="text-neutral-500">复测</div></div>
            <div><div className="text-lg font-semibold">{activeCase.referralCount}</div><div className="text-neutral-500">转介</div></div>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-neutral-500">暂无活动事项。</div>
      )}
    </section>
  );
}
