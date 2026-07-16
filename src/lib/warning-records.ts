import { riskLevelLabels } from "@/types/warning";
import type {
  WarningFeedbackCollaboration,
  WarningFeedbackRecord,
  WarningFeedbackRequest,
  WarningItem,
  WarningReferralRecord,
  WarningTimelineItem,
  WarningTimelineSourceType,
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
    rounds: newestFirst(requests, (request) => request.requestedAt).map((request) => {
      const requestRecords = [...(linked.get(request.id) ?? [])].sort((left, right) =>
        right.submittedAt.localeCompare(left.submittedAt),
      );
      return {
        request: requestRecords.length && request.status === "pending"
          ? { ...request, status: "completed" as const }
          : request,
        records: requestRecords,
      };
    }),
    proactiveRecords: newestFirst(proactiveRecords, (record) => record.submittedAt),
    unmatchedRecords: newestFirst(unmatchedRecords, (record) => record.submittedAt),
    dataIssues,
  };
}

function feedbackDescription(record: WarningFeedbackRecord) {
  const content = record.content.trim();
  return content.length > 80 ? `${content.slice(0, 80)}…` : content;
}

function sourceTimelineItem({
  sourceType,
  sourceId,
  title,
  operator,
  occurredAt,
  description,
}: {
  sourceType: WarningTimelineSourceType;
  sourceId: string;
  title: string;
  operator: string;
  occurredAt: string;
  description: string;
}): WarningTimelineItem {
  return {
    id: `TL-${sourceType}-${sourceId}`,
    sourceType,
    sourceId,
    title,
    operator,
    occurredAt,
    description,
  };
}

function canonicalTimelineTitle(title: string) {
  const aliases: Record<string, string> = {
    "新增干预记录": "记录干预结果",
    "心理老师新增干预记录": "记录干预结果",
    "改约干预": "调整干预预约",
    "记录未到场并改约": "确认未到场并重新预约",
    "班主任提交反馈": "班主任提交观察反馈",
  };
  return aliases[title] ?? title;
}

function normalizeTransitionDescription(warning: WarningItem, item: WarningTimelineItem) {
  const title = canonicalTimelineTitle(item.title);
  if (title === "确认正式预警" && warning.confirmedRiskLevel) {
    return `心理老师完成复核，正式确认${riskLevelLabels[warning.confirmedRiskLevel]}；系统已生成班主任协作任务与通知计划。`;
  }
  if (title === "标记继续观察" && warning.observationNote && warning.nextReviewAt) {
    return `观察说明：${warning.observationNote}；下次复核时间：${warning.nextReviewAt}；已向班主任请求反馈：${warning.feedbackRequestNote || "-"}；截止时间：${warning.feedbackDeadline || "-"}。`;
  }
  return item.description
    .replaceAll("系统已同步通知对应班主任", "系统已生成对应班主任通知计划")
    .replaceAll("系统已通知对应班主任", "系统已生成对应班主任通知计划")
    .replaceAll("并通知对应班主任", "并生成对应班主任通知计划");
}

export function buildEffectiveWarningTimeline(warning: WarningItem): WarningTimelineItem[] {
  const derived: WarningTimelineItem[] = [];

  const requests = [...warning.feedbackRequests]
    .sort((left, right) => left.requestedAt.localeCompare(right.requestedAt));
  requests.forEach((request, index) => {
    derived.push(sourceTimelineItem({
      sourceType: "feedback_request",
      sourceId: request.id,
      title: index === 0 ? "请求补充反馈" : "重新请求反馈",
      operator: request.requestedBy,
      occurredAt: request.requestedAt,
      description: `补充反馈要求：${request.requestNote}；反馈截止时间：${request.deadline}。`,
    }));
  });

  for (const record of warning.feedbackRecords) {
    derived.push({
        ...sourceTimelineItem({
        sourceType: "feedback_record",
        sourceId: record.id,
        title: "班主任提交观察反馈",
        operator: `${record.authorRole} · ${record.authorName}`,
        occurredAt: record.submittedAt,
        description: feedbackDescription(record),
      }),
      id: `TL-FEEDBACK-${record.id}`,
    });
  }

  for (const appointment of warning.interventionAppointments) {
    const previous = appointment.rescheduledFromId
      ? warning.interventionAppointments.find((item) => item.id === appointment.rescheduledFromId)
      : undefined;
    const title = previous?.status === "no_show"
      ? "确认未到场并重新预约"
      : appointment.rescheduledFromId
        ? "调整干预预约"
        : "预约干预";
    derived.push(sourceTimelineItem({
      sourceType: "intervention_appointment",
      sourceId: `${appointment.id}:created`,
      title,
      operator: appointment.createdBy,
      occurredAt: appointment.createdAt,
      description: `${appointment.rescheduledFromId ? "新" : ""}计划时间：${appointment.plannedAt}；地点：${appointment.location}；负责心理老师：${appointment.responsibleTeacher}。`,
    }));
    if (appointment.cancelledAt) {
      derived.push(sourceTimelineItem({
        sourceType: "intervention_appointment",
        sourceId: `${appointment.id}:cancelled`,
        title: "取消干预预约",
        operator: warning.responsibleTeacher,
        occurredAt: appointment.cancelledAt,
        description: `取消原因：${appointment.cancellationReason || "未填写"}。事项回到正式预警，等待重新安排干预。`,
      }));
    }
  }

  for (const record of warning.interventionRecords) {
    derived.push(sourceTimelineItem({
      sourceType: "intervention_record",
      sourceId: record.id,
      title: "记录干预结果",
      operator: record.authorName,
      occurredAt: record.occurredAt,
      description: `干预方式：${record.method}；情况摘要：${record.summary}；本次判断：${record.judgment}；下一步计划：${record.followUpPlan}。`,
    }));
  }

  for (const record of warning.retestRecords) {
    derived.push(sourceTimelineItem({
      sourceType: "retest_record",
      sourceId: `${record.id}:arranged`,
      title: "安排复测",
      operator: warning.responsibleTeacher,
      occurredAt: record.arrangedAt,
      description: `计划时间：${record.plannedAt}；复测量表：${record.scaleNames.join("、")}。`,
    }));
    if (record.completedAt) {
      derived.push(sourceTimelineItem({
        sourceType: "retest_record",
        sourceId: `${record.id}:completed`,
        title: "学生完成复测",
        operator: "学生",
        occurredAt: record.completedAt,
        description: record.resultSummary || "学生已完成计划复测，等待心理老师查看客观结果。",
      }));
    }
  }

  for (const record of warning.referralRecords) {
    derived.push(sourceTimelineItem({
      sourceType: "referral_record",
      sourceId: record.id,
      title: "发起转介",
      operator: warning.responsibleTeacher,
      occurredAt: record.referredAt,
      description: `转介类型：${record.referralType}；机构：${record.organization || "待确认"}；原因：${record.reason}。`,
    }));
    for (const followUp of record.followUpRecords) {
      derived.push(sourceTimelineItem({
        sourceType: "referral_follow_up",
        sourceId: followUp.id,
        title: "新增转介跟进",
        operator: followUp.authorName,
        occurredAt: followUp.occurredAt,
        description: `${followUp.summary}；专业结论：${followUp.conclusion}。`,
      }));
    }
  }

  const derivedSourceKeys = new Set(
    derived.map((item) => `${item.sourceType}:${item.sourceId}`),
  );
  const derivedFactKeys = new Set(
    derived.map((item) => `${item.occurredAt}:${canonicalTimelineTitle(item.title)}`),
  );
  const compatibleTransitions = warning.timeline
    .filter((item) => {
      if (item.sourceType && item.sourceId && derivedSourceKeys.has(`${item.sourceType}:${item.sourceId}`)) {
        return false;
      }
      return !derivedFactKeys.has(`${item.occurredAt}:${canonicalTimelineTitle(item.title)}`);
    })
    .map((item) => ({
      ...item,
      title: canonicalTimelineTitle(item.title),
      description: normalizeTransitionDescription(warning, item),
      sourceType: item.sourceType ?? "warning_transition" as const,
      sourceId: item.sourceId ?? item.id,
    }));

  const bySource = new Map<string, WarningTimelineItem>();
  for (const item of [...compatibleTransitions, ...derived]) {
    bySource.set(`${item.sourceType}:${item.sourceId}`, item);
  }
  return newestFirst([...bySource.values()], (item) => item.occurredAt);
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
      conclusion: "已记录外部转介反馈，事项继续跟进。",
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
