import type {
  StudentProfileCaseSummary,
  StudentProfileDetail,
  StudentProfileRecord,
  StudentProfileSummary,
} from "@/types/studentProfile";
import { getEffectiveRiskLevel, type WarningItem } from "@/types/warning";

export function isActiveProfileWarning(warning: WarningItem) {
  return warning.isActive && warning.currentStatus !== "closed";
}

function sortWarningsNewestFirst(warnings: WarningItem[]) {
  return [...warnings].sort((left, right) =>
    right.activityTime.localeCompare(left.activityTime),
  );
}

function getCaseStartTime(warning: WarningItem) {
  if (warning.timeline.length === 0) {
    return warning.activityTime;
  }

  return warning.timeline.reduce(
    (earliest, item) => item.occurredAt < earliest ? item.occurredAt : earliest,
    warning.timeline[0].occurredAt,
  );
}

function getClosedAt(warning: WarningItem) {
  if (warning.endedAt) {
    return warning.endedAt;
  }

  if (warning.currentStatus !== "closed") {
    return undefined;
  }

  return warning.timeline.find((item) => item.title === "完成闭环归档")?.occurredAt
    ?? warning.activityTime;
}

function buildCaseSummary(warning: WarningItem): StudentProfileCaseSummary {
  const isActive = isActiveProfileWarning(warning);
  const closedEvent = warning.timeline.find((item) => item.title === "完成闭环归档");
  const outcome = isActive
    ? "active"
    : warning.currentStatus === "closed"
      ? "closed"
      : "ended_without_warning";

  return {
    warningId: warning.id,
    isActive,
    sourceType: warning.sourceType,
    riskLevel: getEffectiveRiskLevel(warning),
    suggestedRiskLevel: warning.suggestedRiskLevel,
    confirmedRiskLevel: warning.confirmedRiskLevel,
    riskLevelAdjustmentReason: warning.riskLevelAdjustmentReason,
    currentStatus: warning.currentStatus,
    feedbackStatus: warning.feedbackStatus,
    responsibleTeacher: warning.responsibleTeacher,
    latestActivity: warning.latestActivity,
    activityTime: warning.activityTime,
    startedAt: getCaseStartTime(warning),
    endedAt: getClosedAt(warning),
    outcome,
    outcomeDescription:
      warning.endReason ?? closedEvent?.description ?? warning.latestActivity,
    feedbackCount: warning.feedbackRecords.length,
    interventionCount: warning.interventionRecords.length,
    retestCount: warning.retestRecords.length,
    referralCount: warning.referralRecords.length,
  };
}

function selectWarningsForStudent(
  student: StudentProfileRecord,
  warnings: WarningItem[],
) {
  const warningById = new Map(warnings.map((warning) => [warning.id, warning]));
  const relatedWarnings = sortWarningsNewestFirst(
    warnings.filter((warning) => warning.studentId === student.studentId),
  );
  const relatedIds = new Set(relatedWarnings.map((warning) => warning.id));
  const dataIssues: string[] = [];

  for (const warningId of student.warningCaseIds) {
    const warning = warningById.get(warningId);
    if (!warning) {
      dataIssues.push(`关联事项 ${warningId} 不存在。`);
    } else if (warning.studentId !== student.studentId) {
      dataIssues.push(`关联事项 ${warningId} 属于其他学生。`);
    }
  }

  for (const warning of relatedWarnings) {
    if (!student.warningCaseIds.includes(warning.id)) {
      dataIssues.push(`事项 ${warning.id} 未写入学生 warningCaseIds。`);
    }
    if (warning.studentName !== student.studentName) {
      dataIssues.push(`事项 ${warning.id} 的学生姓名与基础档案不一致。`);
    }
  }

  for (const warningId of student.warningCaseIds) {
    if (relatedIds.has(warningId)) {
      continue;
    }
    const warning = warningById.get(warningId);
    if (warning?.studentId === student.studentId) {
      dataIssues.push(`关联事项 ${warningId} 未能进入聚合结果。`);
    }
  }

  const activeWarnings = relatedWarnings.filter(isActiveProfileWarning);

  const statusesRequiringConfirmedRisk = new Set([
    "formal_warning",
    "in_intervention",
    "pending_retest",
    "referral",
    "closed",
  ]);

  for (const warning of relatedWarnings) {
    if (
      statusesRequiringConfirmedRisk.has(warning.currentStatus) &&
      !warning.confirmedRiskLevel
    ) {
      dataIssues.push(
        `事项 ${warning.id} 已进入正式预警或后续阶段，但缺少心理老师确认风险等级。`,
      );
    }
  }
  if (activeWarnings.length > 1) {
    dataIssues.push(
      `检测到 ${activeWarnings.length} 条活动事项，当前临时展示最近更新的 ${activeWarnings[0].id}。`,
    );
  }

  return {
    relatedWarnings,
    activeWarning: activeWarnings[0],
    dataIssues,
  };
}

export function buildStudentProfileSummary(
  student: StudentProfileRecord,
  warnings: WarningItem[],
): StudentProfileSummary {
  const { relatedWarnings, activeWarning, dataIssues } = selectWarningsForStudent(
    student,
    warnings,
  );

  return {
    ...student,
    hasCurrentWarning: Boolean(activeWarning),
    activeRiskLevel: activeWarning ? getEffectiveRiskLevel(activeWarning) : undefined,
    activeWarningStatus: activeWarning?.currentStatus,
    sourceTypes: Array.from(new Set(relatedWarnings.map((warning) => warning.sourceType))),
    hasFormalWarning: relatedWarnings.some(
      (warning) => Boolean(warning.confirmedRiskLevel),
    ),
    hasInterventionRecords: relatedWarnings.some(
      (warning) => warning.interventionRecords.length > 0,
    ),
    currentResponsiblePsychologist: activeWarning?.responsibleTeacher,
    activeWarningId: activeWarning?.id,
    warningCount: relatedWarnings.length,
    dataIssues,
  };
}

export function buildStudentProfileSummaries(
  students: StudentProfileRecord[],
  warnings: WarningItem[],
) {
  return students.map((student) => buildStudentProfileSummary(student, warnings));
}

export function buildStudentProfileDetail(
  student: StudentProfileRecord,
  warnings: WarningItem[],
): StudentProfileDetail {
  const { relatedWarnings, activeWarning, dataIssues } = selectWarningsForStudent(
    student,
    warnings,
  );
  const summary = buildStudentProfileSummary(student, warnings);

  return {
    student,
    summary,
    activeCase: activeWarning ? buildCaseSummary(activeWarning) : undefined,
    historicalCases: relatedWarnings
      .filter((warning) => !isActiveProfileWarning(warning))
      .map(buildCaseSummary),
    dataIssues,
  };
}
