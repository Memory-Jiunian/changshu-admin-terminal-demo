import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentProfileCaseSummary } from "@/types/studentProfile";
import { feedbackStatusLabels, riskLevelLabels, statusLabels, warningSourceTypeLabels } from "@/types/warning";

export function StudentActiveCase({ activeCase, onViewCaseRecord, onViewWarning }: { activeCase?: StudentProfileCaseSummary; onViewCaseRecord: (warningId: string) => void; onViewWarning: (warningId: string) => void }) {
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
            <div><dt className="text-neutral-500">系统提示风险</dt><dd className="mt-1 font-medium">{riskLevelLabels[activeCase.suggestedRiskLevel]}</dd></div>
            <div><dt className="text-neutral-500">心理老师确认风险</dt><dd className="mt-1 font-medium">{activeCase.confirmedRiskLevel ? riskLevelLabels[activeCase.confirmedRiskLevel] : "待确认"}</dd></div>
            <div><dt className="text-neutral-500">预警状态</dt><dd className="mt-1 font-medium">{statusLabels[activeCase.currentStatus]}</dd></div>
            <div><dt className="text-neutral-500">负责心理老师</dt><dd className="mt-1 font-medium">{activeCase.responsibleTeacher}</dd></div>
            <div><dt className="text-neutral-500">反馈状态</dt><dd className="mt-1 font-medium">{feedbackStatusLabels[activeCase.feedbackStatus]}</dd></div>
            <div><dt className="text-neutral-500">事项开始时间</dt><dd className="mt-1 font-medium">{activeCase.startedAt}</dd></div>
            <div><dt className="text-neutral-500">最近动态时间</dt><dd className="mt-1 font-medium">{activeCase.activityTime}</dd></div>
            <div className="col-span-2"><dt className="text-neutral-500">最近动态</dt><dd className="mt-1 leading-6 text-neutral-800">{activeCase.latestActivity}</dd></div>
            {activeCase.riskLevelAdjustmentReason ? <div className="col-span-2"><dt className="text-neutral-500">风险等级调整理由</dt><dd className="mt-1 leading-6 text-neutral-800">{activeCase.riskLevelAdjustmentReason}</dd></div> : null}
          </dl>
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-neutral-200 pt-4 text-center text-xs">
            <div><div className="text-lg font-semibold">{activeCase.feedbackCount}</div><div className="text-neutral-500">反馈</div></div>
            <div><div className="text-lg font-semibold">{activeCase.interventionCount}</div><div className="text-neutral-500">干预</div></div>
            <div><div className="text-lg font-semibold">{activeCase.retestCount}</div><div className="text-neutral-500">复测</div></div>
            <div><div className="text-lg font-semibold">{activeCase.referralCount}</div><div className="text-neutral-500">转介</div></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => onViewCaseRecord(activeCase.warningId)} type="button">查看完整记录</Button>
            <Button onClick={() => onViewWarning(activeCase.warningId)} type="button" variant="outline">查看预警详情</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm">
          <div className="font-medium text-neutral-800">暂无活动事项</div>
          <div className="mt-1 text-neutral-500">暂无活动风险</div>
        </div>
      )}
    </section>
  );
}
