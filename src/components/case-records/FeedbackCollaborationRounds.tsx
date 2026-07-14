import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import type { WarningFeedbackCollaboration, WarningFeedbackRecord } from "@/types/warning";

function FeedbackItem({ record }: { record: WarningFeedbackRecord }) {
  return <div className="rounded border border-neutral-200 bg-white p-3">
    <div className="flex justify-between gap-3 text-xs text-neutral-500"><strong className="text-neutral-900">{record.authorRole} · {record.authorName}</strong><span>{record.submittedAt}</span></div>
    <p className="mt-2 text-sm leading-6 text-neutral-700">{record.content}</p>
  </div>;
}

export function FeedbackCollaborationRounds({ collaboration }: { collaboration: WarningFeedbackCollaboration }) {
  const empty = !collaboration.rounds.length && !collaboration.proactiveRecords.length && !collaboration.unmatchedRecords.length;
  if (empty) return <CaseRecordEmptyState text="暂无班主任协作记录" />;
  return <div className="space-y-4">
    {collaboration.rounds.map(({ request, records }) => <section className="rounded-md border border-neutral-200 bg-neutral-50 p-3" key={request.id}>
      <div className="flex flex-wrap justify-between gap-2 text-sm"><strong>反馈请求 · {request.requestedAt}</strong><span className="text-xs text-neutral-500">截止 {request.deadline}</span></div>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{request.requestNote}</p>
      <div className="mt-3 space-y-2">{records.length ? records.map((record) => <FeedbackItem key={record.id} record={record} />) : <CaseRecordEmptyState text="本轮尚未收到反馈" />}</div>
    </section>)}
    {collaboration.proactiveRecords.length ? <section><h5 className="mb-2 text-sm font-semibold">主动提交 / 未关联请求</h5><div className="space-y-2">{collaboration.proactiveRecords.map((record) => <FeedbackItem key={record.id} record={record} />)}</div></section> : null}
    {collaboration.unmatchedRecords.length ? <section><h5 className="mb-2 text-sm font-semibold text-amber-800">待核对关联</h5><div className="space-y-2">{collaboration.unmatchedRecords.map((record) => <FeedbackItem key={record.id} record={record} />)}</div></section> : null}
    {collaboration.dataIssues.map((issue) => <p className="text-xs text-amber-800" key={issue}>{issue}</p>)}
  </div>;
}
