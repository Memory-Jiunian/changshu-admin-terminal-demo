import { CaseRecordEmptyState } from "@/components/case-records/CaseRecordEmptyState";
import { CaseRecordValue } from "@/components/case-records/CaseRecordSection";
import type { StudentProfileCaseDetail } from "@/types/studentProfile";

export function CaseReferralSection({ detail }: { detail: StudentProfileCaseDetail }) {
  const { summary } = detail;
  const resultTitle = summary.outcome === "closed"
    ? "已闭环"
    : summary.outcome === "ended_without_warning"
      ? "未形成正式预警"
      : "事项仍在处理中";

  return (
    <div className="space-y-5">
      <div>
        <h4 className="mb-2 text-sm font-medium text-neutral-900">转介记录</h4>
        {detail.referralRecords.length ? (
          <div className="space-y-2">
            {detail.referralRecords.map((record) => (
              <dl className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2" key={record.id}>
                <CaseRecordValue label="发起时间" value={record.referredAt} />
                <CaseRecordValue label="转介类型" value={record.referralType} />
                <CaseRecordValue label="转介机构" value={record.organization} />
                <CaseRecordValue label="转介原因" value={record.reason} />
                <div className="sm:col-span-2">
                  <div className="mb-2 text-xs font-semibold text-neutral-500">转介跟进</div>
                  {record.followUpRecords.length ? <div className="space-y-2">{record.followUpRecords.map((item) => (
                    <div className="rounded border border-neutral-200 bg-white p-2" key={item.id}>
                      <div className="flex justify-between gap-3 text-xs text-neutral-500"><strong className="text-neutral-900">{item.authorName}</strong><span>{item.occurredAt}</span></div>
                      <p className="mt-1 text-sm leading-6 text-neutral-700">事实摘要：{item.summary}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-700">专业结论：{item.conclusion}</p>
                    </div>
                  ))}</div> : <CaseRecordEmptyState text="尚无转介跟进" />}
                </div>
              </dl>
            ))}
          </div>
        ) : <CaseRecordEmptyState text="暂无转介记录" />}
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium text-neutral-900">结束结果</h4>
        <dl className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2">
          <CaseRecordValue label="结果" value={resultTitle} />
          <CaseRecordValue label="结束 / 闭环时间" value={summary.endedAt} />
          <div className="sm:col-span-2"><CaseRecordValue label="闭环说明 / 结束原因" value={summary.outcome === "active" ? "事项仍在处理中" : summary.outcomeDescription} /></div>
        </dl>
      </div>
    </div>
  );
}
