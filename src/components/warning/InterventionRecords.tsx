import type { WarningInterventionRecord } from "@/types/warning";

type InterventionRecordsProps = {
  records: WarningInterventionRecord[];
};

function InterventionRecordItem({ record }: { record: WarningInterventionRecord }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-neutral-900">{record.method}</div>
        <div className="shrink-0 text-xs text-neutral-500">{record.occurredAt}</div>
      </div>
      <div className="mt-1 text-xs font-medium text-neutral-500">记录人：{record.authorName}</div>
      <dl className="mt-3 space-y-2 text-sm leading-6">
        <div>
          <dt className="font-semibold text-neutral-500">情况摘要</dt>
          <dd className="text-neutral-800">{record.summary}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">本次判断</dt>
          <dd className="text-neutral-800">{record.judgment}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">后续计划</dt>
          <dd className="text-neutral-800">{record.followUpPlan}</dd>
        </div>
      </dl>
    </div>
  );
}

export function InterventionRecords({ records }: InterventionRecordsProps) {
  const sortedRecords = [...records].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">干预记录</h3>
        <span className="text-xs font-medium text-neutral-500">共 {sortedRecords.length} 条</span>
      </div>

      {sortedRecords.length > 0 ? (
        <div className="space-y-2">
          {sortedRecords.map((record) => (
            <InterventionRecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          暂无干预记录
        </div>
      )}
    </section>
  );
}
