import type {
  WarningFeedbackCollaboration,
  WarningFeedbackRecord,
  WarningFeedbackRequest,
  WarningItem,
  WarningReferralRecord,
  WarningTimelineItem,
} from "@/types/warning";

function newestFirst<T>(items: T[], getTime: (item: T) => string) {
  return [...items].sort((left, right) => getTime(right).localeCompare(getTime(left)));
}

export function buildWarningFeedbackCollaboration(
  requests: WarningFeedbackRequest[],
  records: WarningFeedbackRecord[],
): WarningFeedbackCollaboration {
  const requestIds = new Set(requests.map((request) => request.id));
  const linked = new Map<string, WarningFeedbackRecord[]>();
  const proactiveRecords: WarningFeedbackRecord[] = [];
  const unmatchedRecords: WarningFeedbackRecord[] = [];
  const dataIssues: string[] = [];

  for (const record of records) {
    if (!record.requestId) {
      proactiveRecords.push(record);
      continue;
    }
    if (!requestIds.has(record.requestId)) {
      unmatchedRecords.push(record);
      dataIssues.push(`反馈 ${record.id} 引用了不存在的请求 ${record.requestId}。`);
      continue;
    }
    linked.set(record.requestId, [...(linked.get(record.requestId) ?? []), record]);
  }

  return {
    rounds: newestFirst(requests, (request) => request.requestedAt).map((request) => ({
      request,
      records: [...(linked.get(request.id) ?? [])].sort((left, right) =>
        left.submittedAt.localeCompare(right.submittedAt),
      ),
    })),
    proactiveRecords: newestFirst(proactiveRecords, (record) => record.submittedAt),
    unmatchedRecords: newestFirst(unmatchedRecords, (record) => record.submittedAt),
    dataIssues,
  };
}

function feedbackDescription(record: WarningFeedbackRecord) {
  const content = record.content.trim();
  return content.length > 80 ? `${content.slice(0, 80)}…` : content;
}

export function buildEffectiveWarningTimeline(warning: WarningItem): WarningTimelineItem[] {
  const byId = new Map<string, WarningTimelineItem>();
  for (const item of warning.timeline) {
    byId.set(item.id, item);
  }
  for (const record of warning.feedbackRecords) {
    const id = `TL-FEEDBACK-${record.id}`;
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        title: "班主任提交观察反馈",
        operator: `${record.authorRole} · ${record.authorName}`,
        occurredAt: record.submittedAt,
        description: feedbackDescription(record),
      });
    }
  }
  return newestFirst([...byId.values()], (item) => item.occurredAt);
}

export function migrateWarningReferralRecord(record: WarningReferralRecord): {
  record: WarningReferralRecord;
  dataIssues: string[];
} {
  const dataIssues: string[] = [];
  const followUpRecords = [...(record.followUpRecords ?? [])];
  if (record.resultRecordedAt && record.resultSummary && followUpRecords.length === 0) {
    followUpRecords.push({
      id: `RFF-MIGRATED-${record.id}`,
      occurredAt: record.resultRecordedAt,
      authorName: "负责心理老师",
      summary: record.resultSummary,
    });
  } else if (Boolean(record.resultRecordedAt) !== Boolean(record.resultSummary)) {
    dataIssues.push(`转介记录 ${record.id} 的旧结果时间与摘要不完整，已保留原字段供核查。`);
  }
  return {
    record: {
      ...record,
      followUpRecords: newestFirst(followUpRecords, (item) => item.occurredAt),
    },
    dataIssues,
  };
}
