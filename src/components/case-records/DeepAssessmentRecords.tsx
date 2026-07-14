import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { riskLevelLabels, type WarningDeepAssessmentRecord } from "@/types/warning";

export function DeepAssessmentRecords({ records }: { records: WarningDeepAssessmentRecord[] }) {
  if (!records.length) return <CaseRecordEmptyState text="暂无完整深度测评记录" />;
  return <div className="space-y-3">{records.map((record) => (
    <details className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={record.id}>
      <summary className="cursor-pointer text-sm font-semibold text-neutral-900">
        {record.scaleName} · {record.completedAt}
      </summary>
      <div className="mt-3 space-y-4 text-sm text-neutral-700">
        <div className="grid gap-2 sm:grid-cols-2">
          <span>风险等级：{riskLevelLabels[record.riskLevel]}</span>
          <span>总分：{record.totalScore ?? "-"}</span>
          <span>开始时间：{record.startedAt ?? "-"}</span>
          <span>完成时间：{record.completedAt}</span>
          <span className="sm:col-span-2">结果摘要：{record.resultSummary || "暂无"}</span>
        </div>
        <div>
          <h5 className="font-semibold text-neutral-900">维度结果</h5>
          <div className="mt-2 space-y-2">{record.dimensions.map((item) => (
            <div className="rounded border border-neutral-200 bg-white p-2" key={item.id}>
              <strong>{item.name}</strong> · {item.score ?? "-"} · {item.level ?? "-"}
              {item.summary ? <p className="mt-1">{item.summary}</p> : null}
            </div>
          ))}</div>
        </div>
        <div>
          <h5 className="font-semibold text-neutral-900">完整作答</h5>
          <ol className="mt-2 space-y-2">{record.responses.map((item, index) => (
            <li className="rounded border border-neutral-200 bg-white p-2" key={item.id}>
              <div>{index + 1}. {item.questionText}</div>
              <div className="mt-1 text-neutral-600">回答：{item.answerText}{item.score !== undefined ? ` · ${item.score} 分` : ""}</div>
            </li>
          ))}</ol>
        </div>
      </div>
    </details>
  ))}</div>;
}
