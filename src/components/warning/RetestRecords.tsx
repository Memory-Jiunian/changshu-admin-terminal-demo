import type { WarningRetestRecord } from "@/types/warning";

type RetestRecordsProps = {
  records: WarningRetestRecord[];
};

function displayValue(value?: string) {
  return value || "-";
}

function RetestRecordItem({ record }: { record: WarningRetestRecord }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs font-semibold text-neutral-500">安排时间</div>
          <div className="mt-1 font-medium text-neutral-800">{record.arrangedAt}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-neutral-500">计划复测时间</div>
          <div className="mt-1 font-medium text-neutral-800">{record.plannedAt}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-neutral-500">实际完成时间</div>
          <div className="mt-1 font-medium text-neutral-800">
            {displayValue(record.completedAt)}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs font-semibold text-neutral-500">复测量表</div>
          <div className="mt-1 font-medium text-neutral-800">
            {record.scaleNames.join("、") || "-"}
          </div>
        </div>
      </div>

      <dl className="mt-3 space-y-2 text-sm leading-6">
        <div>
          <dt className="font-semibold text-neutral-500">复测结果摘要</dt>
          <dd className="text-neutral-800">{displayValue(record.resultSummary)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">与上次结果对比</dt>
          <dd className="text-neutral-800">{displayValue(record.comparison)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-500">心理老师结论</dt>
          <dd className="text-neutral-800">{displayValue(record.conclusion)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function RetestRecords({ records }: RetestRecordsProps) {
  const sortedRecords = [...records].sort((left, right) =>
    right.arrangedAt.localeCompare(left.arrangedAt),
  );

  if (sortedRecords.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">复测记录</h3>
        <span className="text-xs font-medium text-neutral-500">共 {sortedRecords.length} 条</span>
      </div>

      <div className="space-y-2">
        {sortedRecords.map((record) => (
          <RetestRecordItem key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}
